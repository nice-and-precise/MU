
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

/**
 * @deprecated This module has been ported to Rust/WASM in `src/lib/drilling/core-rs`.
 * Please use the WASM implementation for performance.
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
import { SurveyStation } from '../types';

/**
 * Calculates the Capstan Effect (exponential friction increase due to curvature).
 * T_out = T_in * e^(mu * alpha)
 * @param tensionIn Tension entering the curve (lbs)
 * @param frictionCoeff Coefficient of friction (mu)
 * @param angleRad Cumulative angle of the curve in radians (alpha)
 */
export function calculateCapstanLoad(tensionIn: number, frictionCoeff: number, angleRad: number): number {
    return tensionIn * Math.exp(frictionCoeff * angleRad);
}

/**
 * Calculates detailed pullback force along a trajectory, accounting for Capstan effect at bends.
 * Iterates from the pipe side (entry/exit) back to the rig.
 */
export function calculateDetailedPullback(
    trajectory: SurveyStation[],
    diameterIn: number,
    material: PipeMaterial,
    soilLayers: SoilLayerInput[] | string = 'Clay',
    fluidDensityLbsGal: number = 9.0
): number {
    const props = getPipeProperties(diameterIn, material, fluidDensityLbsGal);

    // Determine base friction coefficient
    let baseFriction = 0.3;
    if (typeof soilLayers === 'string') {
        if (soilLayers === 'Sand') baseFriction = 0.5;
        if (soilLayers === 'Rock') baseFriction = 0.6;
    } else if (Array.isArray(soilLayers) && soilLayers.length > 0) {
        // Simplified: use max friction for safety
        baseFriction = soilLayers.reduce((max, layer) => {
            let f = 0.3;
            if (layer.soilType === 'Sand') f = 0.5;
            if (layer.soilType === 'Rock') f = 0.6;
            return f > max ? f : max;
        }, 0.3);
    }

    // Effective weight (normal force) per ft
    // If pipe floats (negative buoyancy), it drags on top. If sinks, drags on bottom.
    // Friction acts on the normal force.
    const w_eff = Math.abs(props.buoyancyFactor);

    // Fluidic Drag (Hydrokinetic)
    // Heuristic: 0.05 psi shear stress? 
    // Let's use the spec's implied need for a variable. 
    // For now, keep the heuristic: 0.5 lbs/in diameter / ft
    const fluidDragPerFt = diameterIn * 0.5;

    let totalTension = 0;

    // Iterate backwards from the pipe side (end of trajectory?) 
    // Actually, we pull FROM the rig. The pipe starts at the "Exit" side and is pulled TO the "Entry" side.
    // Let's assume trajectory is ordered Entry -> Exit.
    // We pull from Entry. The load accumulates from Exit (0 tension) to Entry (Max tension).

    // We iterate from the last station (Exit) backwards to the first (Entry).
    for (let i = trajectory.length - 1; i > 0; i--) {
        const curr = trajectory[i];
        const prev = trajectory[i - 1];

        // Segment Length
        const len = curr.md - prev.md;
        if (len <= 0) continue;

        // 1. Linear Drag (Friction + Fluid)
        const segmentDrag = len * (w_eff * baseFriction + fluidDragPerFt);

        // Add to total tension
        totalTension += segmentDrag;

        // 2. Capstan Effect (Curvature)
        // Calculate bend angle (Dogleg) in this segment
        // We need the change in angle. 
        // DLS is deg/100ft. Angle = (DLS / 100) * len
        // Or calculate from Inc/Azi change.
        // Let's use the DLS stored in the station if available, or calc it.

        const dls = curr.dls || 0;
        // If DLS is missing, we could calc it, but let's assume trajectory has it.

        // Bend angle in radians
        // DLS is degrees per 100ft.
        // alpha_deg = (dls / 100) * len
        const alphaRad = ((dls / 100) * len) * (Math.PI / 180);

        if (alphaRad > 0) {
            totalTension = calculateCapstanLoad(totalTension, baseFriction, alphaRad);
        }
    }

    return totalTension;
}

/**
 * Legacy simplified calculation (kept for backward compatibility)
 */
export function calculatePullbackForce(
    lengthFt: number,
    diameterIn: number,
    material: PipeMaterial,
    soilLayers: SoilLayerInput[] | string = 'Clay',
    safetyFactor: number = 1.5
): number {
    const props = getPipeProperties(diameterIn, material);
    let coeffFriction = 0.3;
    if (typeof soilLayers === 'string') {
        if (soilLayers === 'Sand') coeffFriction = 0.5;
        if (soilLayers === 'Rock') coeffFriction = 0.6;
    }

    const normalForcePerFt = Math.abs(props.buoyancyFactor);
    const frictionDrag = lengthFt * normalForcePerFt * coeffFriction;
    const fluidDrag = lengthFt * (diameterIn * 0.5);

    return (frictionDrag + fluidDrag) * safetyFactor;
}
