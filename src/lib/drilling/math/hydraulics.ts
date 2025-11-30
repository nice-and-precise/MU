
/**
 * HDD Hydraulics & Hydro-Fracture Analysis
 * 
 * Calculates:
 * 1. Required Borehole Pressure (P_req) = Hydrostatic Head + Annular Pressure Loss
 * 2. Maximum Allowable Annular Pressure (P_max) = Limit before soil fracture
 * 
 * Models:
 * - Rheology: Bingham Plastic (Yield Point + Plastic Viscosity)
 * - Frac-Out: Delft Equation (Cavity Expansion)
 */

export interface FluidProperties {
    density: number; // ppg (pounds per gallon)
    viscosity: number; // Plastic Viscosity (cP) - typically 10-30
    yieldPoint: number; // Yield Point (lb/100ft2) - typically 15-40
}

export interface BoreholeGeometry {
    holeDiameterIn: number;
    pipeDiameterIn: number;
    lengthFt: number; // Current length drilled
    depthFt: number; // Vertical depth at current point
}

export interface SoilProperties {
    shearStrengthPsi: number; // Undrained shear strength (Su)
    shearModulusPsi: number; // G
    porePressurePsi: number; // Groundwater pressure (u)
}

// Minimal interface matching Prisma SoilLayer
export interface SoilLayerInput {
    startDepth: number;
    endDepth: number;
    soilType: string;
    hardness?: number | null;
    rockStrengthPsi?: number | null;
}

/**
 * Maps a SoilLayer to engineering properties (Heuristic/Lookup)
 */
export function getSoilProperties(layer: SoilLayerInput, depthFt: number): SoilProperties {
    // Default values if no specific data
    let shearStrength = 5; // psi (Soft Clay)
    let shearModulus = 500; // psi

    switch (layer.soilType) {
        case 'Clay':
            // Hardness 1-10 map to Shear Strength 2-20 psi
            shearStrength = (layer.hardness || 3) * 2;
            shearModulus = shearStrength * 100;
            break;
        case 'Sand':
            // Sand relies on friction, but for cavity expansion we treat it with equivalent cohesion for simplicity
            // or use effective stress.
            shearStrength = 2 + (depthFt * 0.5); // Strength increases with depth
            shearModulus = 1000 + (depthFt * 10);
            break;
        case 'Rock':
            shearStrength = layer.rockStrengthPsi ? layer.rockStrengthPsi / 10 : 500; // PSI
            shearModulus = shearStrength * 500;
            break;
        default:
            shearStrength = 5;
    }

    // Pore Pressure (Hydrostatic assumption)
    // u = 0.433 psi/ft * depth (assuming water table at surface)
    const porePressure = 0.433 * depthFt;

    return {
        shearStrengthPsi: shearStrength,
        shearModulusPsi: shearModulus,
        porePressurePsi: porePressure
    };
}

/**
 * Calculates the Annular Pressure Loss (APL) using Bingham Plastic model for laminar flow.
 * APL = (Length * (YieldPoint + PlasticViscosity * Velocity / Gap)) / Factor
 * 
 * Simplified Carpenter's Rule of Thumb or Bingham approximation suitable for HDD.
 */
export function calculateAnnularPressureLoss(
    fluid: FluidProperties,
    geo: BoreholeGeometry,
    pumpRateGpm: number
): number {
    // 1. Annular Velocity (ft/min)
    const Dh = geo.holeDiameterIn;
    const Dp = geo.pipeDiameterIn;
    const annularAreaSqIn = (Math.PI / 4) * (Math.pow(Dh, 2) - Math.pow(Dp, 2));

    // Velocity = Flow / Area
    // GPM to ft3/min: / 7.48
    // Area in2 to ft2: / 144
    const flowFt3Min = pumpRateGpm / 7.48;
    const areaFt2 = annularAreaSqIn / 144;
    const velocityFtMin = flowFt3Min / areaFt2;

    // 2. Pressure Loss Calculation (Bingham Plastic - Laminar Flow in Annulus)
    // dP/dL = [ PV * V / (1000 * (Dh - Dp)^2) + YP / (200 * (Dh - Dp)) ] ... (Oilfield units approx)
    // Let's use a standard HDD approximation:
    // P_loss (psi) = Length * ( (PV * V) / (60000 * (Dh-Dp)^2) + YP / (200 * (Dh-Dp)) )
    // Note: Dh, Dp in inches. V in ft/min? No, usually ft/sec for these formulas.

    const V_ft_sec = velocityFtMin / 60;
    const D_diff = Dh - Dp; // Clearance

    // Viscous component
    const term1 = (fluid.viscosity * V_ft_sec) / (60000 * Math.pow(D_diff, 2)); // Very small
    // Yield component (dominant in slow flow)
    const term2 = fluid.yieldPoint / (200 * D_diff);

    // This formula yields psi per foot? No, usually psi.
    // Let's use a simpler industry rule of thumb if exact rheology is unknown:
    // 10-50 psi per 1000ft is typical.
    // Let's stick to the Bingham model but ensure units align.

    // Corrected simplified formula for HDD (psi):
    // APL = ( (PV * V_ft_min) / (1000 * (Dh-Dp)^2) + YP / (200 * (Dh-Dp)) ) * Length

    const pressureLossPsi = (
        (fluid.viscosity * velocityFtMin) / (1000 * Math.pow(D_diff, 2)) +
        (fluid.yieldPoint / (200 * D_diff))
    ) * geo.lengthFt;

    return pressureLossPsi;
}

/**
 * Calculates the Total Required Borehole Pressure.
 * P_req = Hydrostatic Head + Annular Pressure Loss
 */
export function calculateRequiredPressure(
    fluid: FluidProperties,
    geo: BoreholeGeometry,
    pumpRateGpm: number
): number {
    // 1. Hydrostatic Head (Pressure of the mud column)
    // P_hydro = 0.052 * Density(ppg) * Depth(ft)
    const hydrostaticPsi = 0.052 * fluid.density * geo.depthFt;

    // 2. Friction Loss (APL)
    const aplPsi = calculateAnnularPressureLoss(fluid, geo, pumpRateGpm);

    return hydrostaticPsi + aplPsi;
}

/**
 * Calculates Maximum Allowable Annular Pressure (P_max) using Delft / Cavity Expansion.
 * P_max = P_pore + P_elastic + P_plastic
 * Simplified: P_max = u + G' * (R_plastic/R_hole)^2 ...
 * 
 * Practical HDD Formula (Queen's University / Delft simplified):
 * P_max = TotalStress + Su * N
 * Where N is a cavity expansion factor (approx 2.0 - 4.0 depending on soil stiffness)
 */
export function calculateMaxAllowablePressure(
    depthFt: number,
    soil: SoilProperties
): number {
    // 1. Total Overburden Stress (Sigma_v)
    // Assume soil density ~110 pcf (approx 15 ppg equivalent? No, 110/144 = 0.76 psi/ft)
    // Soil density typically 100-120 pcf.
    const soilDensityPcf = 110;
    const sigma_v_psi = (soilDensityPcf * depthFt) / 144;

    // 2. Cavity Expansion Limit
    // P_max = Sigma_v + Su * (Math.log(G/Su) + 1) ... (Theoretical max)
    // Let's use the Delft simplified limit often used in software:
    // P_max = Sigma_total + Su * 2.5 (Safety factor included)

    // If we are very shallow, P_max is dominated by soil weight lifting (Blowout).
    // If deep, dominated by shear failure.

    const maxPressurePsi = sigma_v_psi + (soil.shearStrengthPsi * 2.5);

    return maxPressurePsi;
}

/**
 * Analyzes Frac-Out Risk
 */
export function analyzeFracOutRisk(
    fluid: FluidProperties,
    geo: BoreholeGeometry,
    soilLayers: SoilLayerInput[], // Changed to accept layers
    pumpRateGpm: number
) {
    // 1. Find relevant soil layer
    const layer = soilLayers.find(l => geo.depthFt >= l.startDepth && geo.depthFt <= l.endDepth)
        || soilLayers[0]
        || { soilType: 'Clay', startDepth: 0, endDepth: 100 }; // Fallback

    const soilProps = getSoilProperties(layer, geo.depthFt);

    const pReq = calculateRequiredPressure(fluid, geo, pumpRateGpm);
    const pMax = calculateMaxAllowablePressure(geo.depthFt, soilProps);

    const safetyMargin = pMax - pReq;
    const riskLevel = safetyMargin < 0 ? 'CRITICAL' : (safetyMargin < 10 ? 'HIGH' : 'LOW');

    return {
        pReq,
        pMax,
        safetyMargin,
        riskLevel,
        activeLayer: layer.soilType
    };
}
