import { SurveyStation } from './types';

export interface Obstacle {
    id: string;
    name: string;
    type: string;
    startX: number;
    startY: number;
    startZ: number;
    endX?: number | null;
    endY?: number | null;
    endZ?: number | null;
    diameter?: number | null;
    safetyBuffer: number;
}

export interface CollisionResult {
    hasCollision: boolean;
    warnings: string[];
    closestDistance: number;
    riskLevel: 'SAFE' | 'WARNING' | 'CRITICAL';
}

/**
 * Checks for collisions between a planned bore path and a set of obstacles.
 * Uses simple 3D distance calculations.
 */
export function checkCollision(path: SurveyStation[], obstacles: Obstacle[]): CollisionResult {
    let hasCollision = false;
    let warnings: string[] = [];
    let minDistance = Infinity;
    let riskLevel: 'SAFE' | 'WARNING' | 'CRITICAL' = 'SAFE';

    if (!path.length || !obstacles.length) {
        return { hasCollision: false, warnings: [], closestDistance: Infinity, riskLevel: 'SAFE' };
    }

    // Iterate through each point in the path
    // Note: This is a simplified point-to-obstacle check. 
    // For higher precision, we should check segment-to-segment distance.
    for (const station of path) {
        // Convert station coordinates to 3D point (assuming local grid relative to entry)
        // In a real app, we'd need to handle coordinate systems (Lat/Lon vs Local Grid)
        // Here we assume station.easting, station.northing, station.tvd are in the same units as obstacle coords
        const pX = station.east;
        const pY = station.north;
        const pZ = station.tvd; // True Vertical Depth (positive down usually, but check convention)

        for (const obstacle of obstacles) {
            const dist = getDistanceToObstacle(pX, pY, pZ, obstacle);

            if (dist < minDistance) {
                minDistance = dist;
            }

            // Check against safety buffer
            // Effective radius = (Obstacle Radius) + (Bore Radius - ignored for now) + Safety Buffer
            const obstacleRadius = (obstacle.diameter || 0) / 24; // Diameter in inches -> Radius in feet
            const safetyThreshold = obstacle.safetyBuffer + obstacleRadius;

            if (dist < safetyThreshold) {
                hasCollision = true;
                riskLevel = 'CRITICAL';
                warnings.push(`CRITICAL: Collision detected with ${obstacle.name} at MD ${station.md.toFixed(1)}' (Dist: ${dist.toFixed(2)}')`);
            } else if (dist < safetyThreshold * 1.5) {
                if (riskLevel !== 'CRITICAL') riskLevel = 'WARNING';
                warnings.push(`WARNING: Proximity to ${obstacle.name} at MD ${station.md.toFixed(1)}' (Dist: ${dist.toFixed(2)}')`);
            }
        }
    }

    // Deduplicate warnings
    warnings = [...new Set(warnings)];

    return {
        hasCollision,
        warnings,
        closestDistance: minDistance,
        riskLevel
    };
}

function getDistanceToObstacle(x: number, y: number, z: number, obstacle: Obstacle): number {
    // If obstacle is a point (no end coords)
    if (obstacle.endX === null || obstacle.endX === undefined) {
        return Math.sqrt(
            Math.pow(x - obstacle.startX, 2) +
            Math.pow(y - obstacle.startY, 2) +
            Math.pow(z - obstacle.startZ, 2)
        );
    }

    // If obstacle is a line segment (e.g. pipe)
    // Distance from point to line segment
    const x1 = obstacle.startX;
    const y1 = obstacle.startY;
    const z1 = obstacle.startZ;
    const x2 = obstacle.endX;
    const y2 = obstacle.endY!; // We checked for null above, but TS might need help
    const z2 = obstacle.endZ || z1; // Assume flat if Z missing

    const l2 = Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2);

    if (l2 === 0) return getDistanceToObstacle(x, y, z, { ...obstacle, endX: null }); // Treat as point

    // Project point onto line, clamped to segment
    let t = ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1) + (z - z1) * (z2 - z1)) / l2;
    t = Math.max(0, Math.min(1, t));

    const projX = x1 + t * (x2 - x1);
    const projY = y1 + t * (y2 - y1);
    const projZ = z1 + t * (z2 - z1);

    return Math.sqrt(
        Math.pow(x - projX, 2) +
        Math.pow(y - projY, 2) +
        Math.pow(z - projZ, 2)
    );
}
