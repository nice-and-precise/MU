
/**
 * ASTM F1962 Simplified Pullback Load Calculations
 * 
 * This module provides functions to estimate the tensile load on a pipe during HDD installation.
 * It accounts for:
 * - Pipe Weight & Buoyancy
 * - Friction against the borehole wall
 * - Fluid Drag
 * - Capstan effect (curvature friction) - Simplified as a safety factor for this implementation
 */

import { SoilLayerInput } from './hydraulics';

export type PipeMaterial = 'HDPE' | 'PVC' | 'Steel' | 'Ductile Iron';

interface PipeProperties {
    weightPerFt: number; // lbs/ft
    buoyancyFactor: number; // Net weight in fluid (negative = floats)
}

/**
 * Estimates pipe weight and buoyancy properties.
 * @param diameterIn Nominal diameter in inches
 * @param material Pipe material
 * @param fluidDensityLbsGal Drilling fluid density (default 8.6 ppg for water/light mud)
 */
export function getPipeProperties(diameterIn: number, material: PipeMaterial, fluidDensityLbsGal: number = 9.0): PipeProperties {
    // Approximate weights based on standard SDR 11 HDPE or Schedule 40 Steel
    // Volume of pipe material per foot approx: PI * D * t * 12

    let densityLbsIn3 = 0.034; // HDPE
    let wallThickness = diameterIn / 11; // SDR 11

    if (material === 'Steel') {
        densityLbsIn3 = 0.284;
        wallThickness = diameterIn * 0.05; // Approx thin wall
    } else if (material === 'PVC') {
        densityLbsIn3 = 0.05;
        wallThickness = diameterIn / 18; // DR 18
    }

    // Calculate Pipe Weight in Air
    // Area = PI/4 * (OD^2 - ID^2)
    const od = diameterIn;
    const id = diameterIn - (2 * wallThickness);
    const areaMaterial = (Math.PI / 4) * (Math.pow(od, 2) - Math.pow(id, 2));
    const weightAir = areaMaterial * 12 * densityLbsIn3; // lbs/ft

    // Calculate Displaced Fluid Weight (Buoyancy)
    // Vol Displaced = PI/4 * OD^2 * 12
    const volDisplacedGal = ((Math.PI / 4) * Math.pow(od, 2) * 12) / 231; // 231 in3 = 1 gal
    const weightFluidDisplaced = volDisplacedGal * fluidDensityLbsGal;

    // Net Weight (Effective Weight)
    // If negative, pipe floats.
    // We usually fill pipe with water to reduce buoyancy, but let's assume empty for worst case installation (or ballasted).
    // ASTM F1962 assumes ballasted if specified. Let's assume empty for conservative drag, 
    // BUT high buoyancy creates high friction against the TOP of the hole.

    // Net forces: W_net = W_air - W_fluid
    const netWeight = weightAir - weightFluidDisplaced;

    return {
        weightPerFt: weightAir,
        buoyancyFactor: netWeight
    };
}

/**
 * Calculates estimated pullback force.
 * T = L * w * f + FluidDrag
 * Where:
 * L = Length (ft)
 * w = Effective weight (lbs/ft) - absolute value because friction acts regardless of floating/sinking
 * f = Coefficient of friction
 */
export function calculatePullbackForce(
    lengthFt: number,
    diameterIn: number,
    material: PipeMaterial,
    soilLayers: SoilLayerInput[] | string = 'Clay', // Accept layers or string
    safetyFactor: number = 1.5
): number {
    const props = getPipeProperties(diameterIn, material);

    // Determine Friction Coefficient
    let coeffFriction = 0.3; // Default Clay

    if (typeof soilLayers === 'string') {
        if (soilLayers === 'Sand') coeffFriction = 0.5;
        if (soilLayers === 'Rock') coeffFriction = 0.6;
    } else if (Array.isArray(soilLayers) && soilLayers.length > 0) {
        // Weighted average or worst case?
        // Let's use the maximum friction found in the layers to be conservative
        const maxFriction = soilLayers.reduce((max, layer) => {
            let f = 0.3;
            if (layer.soilType === 'Sand') f = 0.5;
            if (layer.soilType === 'Rock') f = 0.6;
            if (layer.soilType === 'Gravel') f = 0.55;
            return f > max ? f : max;
        }, 0.3);
        coeffFriction = maxFriction;
    }

    // Effective normal force is roughly the net weight (buoyant weight)
    // If it floats (-10 lbs), it pushes up with 10 lbs. Friction is 10 * coeff.
    const normalForcePerFt = Math.abs(props.buoyancyFactor);

    const frictionDrag = lengthFt * normalForcePerFt * coeffFriction;

    // Fluidic Drag (Viscous drag)
    // Approximation: 0.05 psi per ft of length acting on surface area? 
    // Or simplified: 10-20 lbs per ft for larger pipes.
    // Let's use a simple heuristic: 0.5 lbs/in diameter / ft
    const fluidDrag = lengthFt * (diameterIn * 0.5);

    // Total theoretical load
    const totalLoad = frictionDrag + fluidDrag;

    // Apply Safety Factor (accounts for curvature/capstan effect which multiplies load)
    return totalLoad * safetyFactor;
}
