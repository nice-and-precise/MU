import { SurveyStation } from './types';
import { calculateTrajectory } from './math/mcm';

export interface BoreInput {
    rodPasses?: {
        linearFeet: number;
        pitch: number | null;
        azimuth: number | null;
    }[];
    alignment?: string | null; // GeoJSON LineString
    depthProfile?: string | null; // JSON [{station, depth}]
    borePlan?: {
        entryAngle?: number | null;
        exitAngle?: number | null;
        totalLength: number;
    } | null;
}

/**
 * Converts Bore data (As-Built or Planned) into a SurveyStation trajectory
 * suitable for physics calculations.
 */
export function convertBoreToTrajectory(bore: BoreInput): SurveyStation[] | null {
    // 1. As-Built: Use Rod Passes if available
    if (bore.rodPasses && bore.rodPasses.length > 0) {
        // Filter valid passes
        const validPasses = bore.rodPasses.filter(p =>
            p.linearFeet !== null &&
            p.pitch !== null &&
            p.azimuth !== null
        );

        if (validPasses.length > 0) {
            // Sort by depth (MD)
            validPasses.sort((a, b) => a.linearFeet - b.linearFeet);

            // Convert to MCM input points
            const points = validPasses.map(p => {
                // HDD Pitch to Inclination Conversion
                // Pitch: + is UP (climbing), - is DOWN (diving)
                // Inc: 0 is Vertical Down, 90 is Horizontal
                // Inc = 90 - Pitch
                const pitch = p.pitch!;
                const inc = 90 - pitch;

                return {
                    md: p.linearFeet,
                    inc: inc,
                    azi: p.azimuth!
                };
            });

            // Ensure we have a tie-in at surface (0,0,0) if the first point is not 0
            // Usually rod 1 starts at length ~10ft or 15ft.
            // We need a 0 point.
            if (points[0].md > 0) {
                // Extrapolate backwards or just assume surface is 0,0,0 with same angle?
                // Or assume Entry Angle from Plan?
                // For now, assume start is at surface with same angle as first rod (simplified)
                // Or better: Entry Angle from Plan if available.
                let startInc = points[0].inc;
                const startAzi = points[0].azi;

                if (bore.borePlan?.entryAngle) {
                    // Entry Angle is usually given as positive degrees down (e.g. 12 deg)
                    // So Pitch = -12. Inc = 90 - (-12) = 102.
                    // Wait, if Entry Angle is "12 deg", it means 12 deg from horizontal.
                    // Usually pointing DOWN.
                    // So Pitch is -12.
                    startInc = 90 - (-bore.borePlan.entryAngle);
                }

                points.unshift({
                    md: 0,
                    inc: startInc,
                    azi: startAzi
                });
            }

            return calculateTrajectory(points);
        }
    }

    // 2. Planned: Use Alignment + Depth Profile
    // TODO: Implement parsing of GeoJSON alignment and Depth Profile
    // This requires interpolating 2D path with Depth profile to get 3D points.

    return null;
}
