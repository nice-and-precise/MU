/**
 * @deprecated This module has been ported to Rust/WASM in `src/lib/drilling/core-rs`.
 * Please use the WASM implementation for performance.
 */
import { SurveyStation } from '../types';

const PI = Math.PI;

export const toRad = (deg: number): number => (deg * PI) / 180;
export const toDeg = (rad: number): number => (rad * 180) / PI;

/**
 * Calculates the Dogleg Angle (beta) between two survey stations.
 * @param i1 Inclination at station 1 (radians)
 * @param i2 Inclination at station 2 (radians)
 * @param a1 Azimuth at station 1 (radians)
 * @param a2 Azimuth at station 2 (radians)
 * @returns Dogleg angle in radians
 */
export const calculateDogleg = (i1: number, i2: number, a1: number, a2: number): number => {
    const cosBeta = Math.cos(i1) * Math.cos(i2) + Math.sin(i1) * Math.sin(i2) * Math.cos(a2 - a1);
    // Clamp value to [-1, 1] to avoid NaN from acos due to floating point noise
    const clampedCosBeta = Math.max(-1, Math.min(1, cosBeta));
    return Math.acos(clampedCosBeta);
};

/**
 * Calculates the Ratio Factor (RF) for the Minimum Curvature Method.
 * Handles the straight-hole condition where beta approaches zero.
 * @param beta Dogleg angle in radians
 * @returns Ratio Factor
 */
export const calculateRatioFactor = (beta: number): number => {
    // Threshold for small angle approximation to avoid division by zero
    // 0.0001 radians is approx 0.0057 degrees
    if (beta < 0.0001) {
        // Taylor series expansion could be used, but 1 is sufficient for this threshold
        // RF = (2/beta) * tan(beta/2) -> 1 as beta -> 0
        return 1;
    }
    return (2 / beta) * Math.tan(beta / 2);
};

/**
 * Calculates the next survey station coordinates using Minimum Curvature Method.
 * @param prev Previous SurveyStation
 * @param md Measured Depth of current station
 * @param inc Inclination of current station (degrees)
 * @param azi Azimuth of current station (degrees)
 * @returns New SurveyStation with calculated coordinates
 */
export const calculateNextStation = (
    prev: SurveyStation,
    md: number,
    inc: number,
    azi: number
): SurveyStation => {
    const deltaMD = md - prev.md;

    // Convert inputs to radians
    const i1 = toRad(prev.inc);
    const a1 = toRad(prev.azi);
    const i2 = toRad(inc);
    const a2 = toRad(azi);

    const beta = calculateDogleg(i1, i2, a1, a2);
    const rf = calculateRatioFactor(beta);

    const deltaNorth = (deltaMD / 2) * (Math.sin(i1) * Math.cos(a1) + Math.sin(i2) * Math.cos(a2)) * rf;
    const deltaEast = (deltaMD / 2) * (Math.sin(i1) * Math.sin(a1) + Math.sin(i2) * Math.sin(a2)) * rf;
    const deltaTVD = (deltaMD / 2) * (Math.cos(i1) + Math.cos(i2)) * rf;

    const north = prev.north + deltaNorth;
    const east = prev.east + deltaEast;
    const tvd = prev.tvd + deltaTVD;

    // Calculate Dogleg Severity (DLS) in deg/100ft (assuming feet)
    // DLS = (beta_deg / deltaMD) * 100
    const betaDeg = toDeg(beta);
    const dls = deltaMD > 0 ? (betaDeg / deltaMD) * 100 : 0;

    // Closure calculations
    const cd = Math.sqrt(north * north + east * east);
    const caRad = Math.atan2(east, north);
    const ca = (toDeg(caRad) + 360) % 360;

    return {
        md,
        inc,
        azi,
        tvd,
        north,
        east,
        dls,
        cd,
        ca,
        rf,
    };
};

/**
 * Processes a list of raw survey points (MD, Inc, Azi) into a full Trajectory.
 * Assumes the first point is the tie-in or surface location.
 */
export const calculateTrajectory = (
    rawPoints: { md: number; inc: number; azi: number }[],
    tieIn: SurveyStation = { md: 0, inc: 0, azi: 0, tvd: 0, north: 0, east: 0 }
): SurveyStation[] => {
    const trajectory: SurveyStation[] = [tieIn];

    for (let i = 0; i < rawPoints.length; i++) {
        const point = rawPoints[i];
        // Skip if MD is less than or equal to tie-in (shouldn't happen in valid data)
        if (point.md <= trajectory[trajectory.length - 1].md) continue;

        const nextStation = calculateNextStation(
            trajectory[trajectory.length - 1],
            point.md,
            point.inc,
            point.azi
        );
        trajectory.push(nextStation);
    }

    return trajectory;
};

/**
 * Interpolates a point at any Measured Depth along the wellbore path.
 * Finds the enclosing survey stations and performs a partial MCM calculation.
 */
export const getPointAtMD = (trajectory: SurveyStation[], targetMD: number): SurveyStation | null => {
    if (trajectory.length === 0) return null;
    if (targetMD < trajectory[0].md) return trajectory[0]; // Or null? Return surface for now.
    if (targetMD > trajectory[trajectory.length - 1].md) {
        // Extrapolation could be dangerous, but for now return last point
        return trajectory[trajectory.length - 1];
    }

    // Find enclosing stations
    let prev = trajectory[0];
    let next = trajectory[trajectory.length - 1];

    for (let i = 0; i < trajectory.length - 1; i++) {
        if (targetMD >= trajectory[i].md && targetMD <= trajectory[i + 1].md) {
            prev = trajectory[i];
            next = trajectory[i + 1];
            break;
        }
    }

    if (prev.md === next.md) return prev;

    // Interpolate Inc and Azi
    // Note: Simple linear interpolation of angles is "Tangential", but for finding the point 
    // strictly on the MCM arc, we should technically calculate the sub-arc.
    // However, standard industry practice for "point at MD" often linearly interpolates 
    // the angles over the course length, then runs MCM from the previous station to the target MD.

    const ratio = (targetMD - prev.md) / (next.md - prev.md);

    // Handle Azimuth wrap-around for interpolation
    let deltaAzi = next.azi - prev.azi;
    if (deltaAzi > 180) deltaAzi -= 360;
    if (deltaAzi < -180) deltaAzi += 360;

    const interpInc = prev.inc + (next.inc - prev.inc) * ratio;
    const interpAzi = (prev.azi + deltaAzi * ratio + 360) % 360;

    return calculateNextStation(prev, targetMD, interpInc, interpAzi);
};
