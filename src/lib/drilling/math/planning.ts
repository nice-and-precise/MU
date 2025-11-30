import { RodPlanInput, RodPlanStep } from '../types';
import { toRad, toDeg } from './mcm';

/**
 * Calculates the Minimum Bend Radius based on pipe properties.
 * Simplified version: R = 100 / (MaxBendDegPer100ft * (PI/180))
 * Or if MaxBend is % pitch change per rod:
 * Pitch % = tan(angle). Approx angle for small pitch.
 */
export const calculateMinBendRadius = (maxBendDegPer100ft: number): number => {
    if (maxBendDegPer100ft === 0) return Infinity;
    // Radius = 180 / (PI * curvature)
    // Curvature = deg / length
    return (180 * 100) / (Math.PI * maxBendDegPer100ft);
};

/**
 * Calculates the required Setback Distance.
 * S = R * sin(alpha)
 * @param radius Minimum Bend Radius
 * @param entryAngleDeg Entry Angle in degrees
 */
export const calculateSetback = (radius: number, entryAngleDeg: number): number => {
    const alpha = toRad(entryAngleDeg);
    return radius * Math.sin(alpha);
};

/**
 * Calculates the depth achieved at the end of the curve to horizontal.
 * D = R * (1 - cos(alpha))
 */
export const calculateCurveDepth = (radius: number, entryAngleDeg: number): number => {
    const alpha = toRad(entryAngleDeg);
    return radius * (1 - Math.cos(alpha));
};

/**
 * Generates a Rod-by-Rod plan to reach a target depth from a given entry angle.
 * This is a simplified "build to horizontal" planner.
 */
export const generateRodPlan = (input: RodPlanInput): RodPlanStep[] => {
    const { targetDepth, entryAngle, rodLength, maxBend } = input;
    const plan: RodPlanStep[] = [];

    let currentDepth = 0;
    let currentDistance = 0;
    let currentPitch = entryAngle; // Degrees. Positive usually means pointing down in HDD context, but standard is Inc.
    // HDD Convention: 0 is horizontal, -deg is up, +deg is down? Or Entry is usually 10-20 deg down.
    // Let's assume +Pitch is DOWN (Inc 90 + pitch? No, usually just pitch relative to horizon).
    // Standard Drilling: Inc 0 = Vertical, Inc 90 = Horizontal.
    // HDD: Pitch 0 = Horizontal. Entry 12 deg = pointing down 12 deg.
    // Let's use HDD Pitch convention: + is Down, - is Up.

    let rodCount = 0;

    // 1. Straight tangent if needed? Or start building immediately?
    // Usually start building immediately to level out.

    // Max pitch change per rod.
    // If maxBend is e.g. 5% pitch, that's approx 2.8 degrees.
    // Let's assume maxBend is degrees per rod for simplicity of this function.
    const steerRate = maxBend;

    while (currentDepth < targetDepth && rodCount < 1000) { // Safety break
        rodCount++;

        // Logic: Steer UP until Pitch is 0.
        let action = "Hold";
        let deltaPitch = 0;

        if (currentPitch > 0) {
            // We are pointing down, need to steer up to level out.
            action = "Steer Up";
            deltaPitch = -steerRate;

            // Don't overshoot 0
            if (currentPitch + deltaPitch < 0) {
                deltaPitch = -currentPitch;
                action = "Feather Up";
            }
        } else if (currentPitch < 0) {
            // Pointing up, steer down? (Rare for entry leg)
            action = "Steer Down";
            deltaPitch = steerRate;
        } else {
            // Horizontal
            action = "Push";
            deltaPitch = 0;
        }

        currentPitch += deltaPitch;

        // Calculate position change
        // dDepth = L * sin(pitch)
        // dDist = L * cos(pitch)
        const pitchRad = toRad(currentPitch);
        const dDepth = rodLength * Math.sin(pitchRad);
        const dDist = rodLength * Math.cos(pitchRad);

        currentDepth += dDepth;
        currentDistance += dDist;

        plan.push({
            rodNumber: rodCount,
            md: rodCount * rodLength,
            pitch: currentPitch,
            depth: currentDepth,
            distance: currentDistance,
            action
        });

        // If we are horizontal and at/past target depth, stop?
        // Or if we are just "building to horizontal", we stop when pitch is 0.
        // But we might not be at target depth yet.

        if (currentPitch === 0 && currentDepth < targetDepth) {
            // We leveled out too shallow!
            // This planner is naive. Real planner needs to calculate required steer rate.
            // For this task, we just simulate the "Steer Up" phase.
        }
    }

    return plan;
};
