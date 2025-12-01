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
    const { targetDepth, targetDistance, entryAngle, rodLength, maxBend } = input;
    const plan: RodPlanStep[] = [];

    let currentDepth = 0;
    let currentDistance = 0;
    let currentPitch = entryAngle; // Degrees. Positive is DOWN.
    let rodCount = 0;
    const steerRate = maxBend; // degrees per rod

    // Safety limit
    const maxRods = Math.ceil((targetDistance * 1.5) / rodLength) + 20;

    while (currentDistance < targetDistance && rodCount < maxRods) {
        rodCount++;

        // 1. Calculate Angle to Target
        const dy = targetDepth - currentDepth;
        const dx = targetDistance - currentDistance;

        // If we are very close, just hold?
        let desiredPitch = 0;
        if (dx > 0.1) {
            // atan2 returns radians. Convert to degrees.
            // dy is positive DOWN. dx is positive RIGHT.
            // So atan2(dy, dx) gives positive angle for Down.
            desiredPitch = toDeg(Math.atan2(dy, dx));
        } else {
            desiredPitch = currentPitch; // Hold last pitch
        }

        // 2. Determine Action
        let action = "Hold";
        let deltaPitch = 0;

        const pitchDiff = desiredPitch - currentPitch;

        if (Math.abs(pitchDiff) < 0.1) {
            // On target
            action = "Push"; // or Hold
            deltaPitch = 0;
        } else if (pitchDiff > 0) {
            // Need to increase pitch (Steer Down)
            action = "Steer Down";
            deltaPitch = Math.min(pitchDiff, steerRate);
        } else {
            // Need to decrease pitch (Steer Up)
            action = "Steer Up";
            deltaPitch = Math.max(pitchDiff, -steerRate);
        }

        // 3. Apply Change
        currentPitch += deltaPitch;

        // 4. Calculate new position
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
    }

    return plan;
};
