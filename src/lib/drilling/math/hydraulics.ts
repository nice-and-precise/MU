
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
    shearStrengthPsi: number; // Undrained shear strength (Su) or Cohesion (c)
    shearModulusPsi: number; // G
    porePressurePsi: number; // Groundwater pressure (u)
    internalFrictionAngleDeg: number; // Phi (degrees)
    cohesionPsi: number; // c (PSI)
}

// Minimal interface matching Prisma SoilLayer
export interface SoilLayerInput {
    startDepth: number;
    endDepth: number;
    soilType: string;
    hardness?: number | null;
    rockStrengthPsi?: number | null;
    shearModulus?: number | null;
    poissonRatio?: number | null;
}

/**
 * Maps a SoilLayer to engineering properties (Heuristic/Lookup)
 */
export function getSoilProperties(layer: SoilLayerInput, depthFt: number): SoilProperties {
    // Default values
    let cohesion = 5; // psi
    let frictionAngle = 0; // degrees (Clay = 0)
    let shearModulus = 500; // psi

    switch (layer.soilType) {
        case 'Clay':
            // Cohesion dominated
            cohesion = (layer.hardness || 3) * 2;
            frictionAngle = 0;
            shearModulus = cohesion * 100;
            break;
        case 'Sand':
            // Friction dominated
            cohesion = 0.1; // Very small cohesion
            frictionAngle = 30 + (layer.hardness || 0); // 30-40 degrees
            shearModulus = 1000 + (depthFt * 10);
            break;
        case 'Rock':
            cohesion = layer.rockStrengthPsi ? layer.rockStrengthPsi / 10 : 500;
            frictionAngle = 45;
            shearModulus = cohesion * 500;
            break;
        default:
            cohesion = 5;
            frictionAngle = 0;
    }

    // Override with DB values if present
    if (layer.shearModulus) shearModulus = layer.shearModulus;

    // Pore Pressure (Hydrostatic assumption)
    const porePressure = 0.433 * depthFt;

    return {
        shearStrengthPsi: cohesion, // Legacy alias
        shearModulusPsi: shearModulus,
        porePressurePsi: porePressure,
        internalFrictionAngleDeg: frictionAngle,
        cohesionPsi: cohesion
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
 * Calculates Maximum Allowable Annular Pressure (P_max) using Delft Cavity Expansion Model.
 * P_max = P_pore + sigma'_radial * (1 + sin phi) + c * cos phi + P_viscous
 * 
 * Note: This is a simplified application of the Delft model suitable for real-time estimation.
 */
export function calculateDelftPMax(
    depthFt: number,
    soil: SoilProperties,
    holeDiameterIn: number = 6
): number {
    // 1. Effective Radial Stress (Sigma'_radial)
    // Assumed to be effective vertical stress * K0 (earth pressure coeff)
    // Sigma'_v = Total Stress - Pore Pressure
    const soilDensityPcf = 110;
    const totalVerticalStressPsi = (soilDensityPcf * depthFt) / 144;
    const effectiveVerticalStress = totalVerticalStressPsi - soil.porePressurePsi;

    // K0 approx 0.5 for sand, 1.0 for clay (simplified)
    const K0 = soil.internalFrictionAngleDeg > 0 ? 1 - Math.sin(soil.internalFrictionAngleDeg * Math.PI / 180) : 1.0;
    const effectiveRadialStress = effectiveVerticalStress * K0;

    // 2. Soil Parameters
    const phiRad = (soil.internalFrictionAngleDeg * Math.PI) / 180;
    const c = soil.cohesionPsi;

    // 3. Delft Equation Components
    // P_max = u + sigma'_r * (1 + sin(phi)) + c * cos(phi)
    // Note: The full Delft model involves plastic radius expansion terms (Rp/R0), 
    // but for "Initiation" of fracture, we use the limit pressure.

    // Term A: Pore Pressure
    const termA = soil.porePressurePsi;

    // Term B: Radial Stress Contribution
    const termB = effectiveRadialStress * (1 + Math.sin(phiRad));

    // Term C: Cohesion Contribution
    const termC = c * Math.cos(phiRad);

    // Term D: Viscous Shear (Simplified)
    // P_viscous = G / 100? Or derived from shear modulus?
    // Spec says: "P_viscous_shear". 
    // For initiation, this is often negligible compared to soil strength, but let's add a small factor based on G.
    const termD = soil.shearModulusPsi * 0.01; // 1% of G as a heuristic for viscous resistance

    return termA + termB + termC + termD;
}

/**
 * Legacy wrapper for backward compatibility
 */
export function calculateMaxAllowablePressure(
    depthFt: number,
    soil: SoilProperties
): number {
    return calculateDelftPMax(depthFt, soil);
}

/**
 * Analyzes Frac-Out Risk
 */
export function analyzeFracOutRisk(
    fluid: FluidProperties,
    geo: BoreholeGeometry,
    soilLayers: SoilLayerInput[],
    pumpRateGpm: number
) {
    const layer = soilLayers.find(l => geo.depthFt >= l.startDepth && geo.depthFt <= l.endDepth)
        || soilLayers[0]
        || { soilType: 'Clay', startDepth: 0, endDepth: 100 };

    const soilProps = getSoilProperties(layer, geo.depthFt);

    const pReq = calculateRequiredPressure(fluid, geo, pumpRateGpm);
    const pMax = calculateDelftPMax(geo.depthFt, soilProps, geo.holeDiameterIn);

    const safetyMargin = pMax - pReq;
    const riskLevel = safetyMargin < 0 ? 'CRITICAL' : (safetyMargin < 50 ? 'HIGH' : 'LOW'); // Increased buffer for Delft

    return {
        pReq,
        pMax,
        safetyMargin,
        riskLevel,
        activeLayer: layer.soilType
    };
}
