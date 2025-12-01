import { SurveyStation, Obstacle } from '../types';
import * as THREE from 'three';

export interface CollisionResult {
    obstacleId: string;
    obstacleType: string;
    distance: number; // Center to center distance in feet
    minDistance: number; // Surface to surface distance
    isCollision: boolean; // < 0
    isWarning: boolean; // < warningThreshold
    stationMd: number;
}

/**
 * Calculates the minimum distance between a point and a cylindrical obstacle.
 * Uses start/end points to define the obstacle segment.
 */
export const calculateDistanceToObstacle = (
    point: THREE.Vector3,
    obstacle: Obstacle
): number => {
    // Coordinate System: x=East, y=-TVD, z=-North (matches Borehole3D)
    // Obstacle DB: startX (East), startY (Depth/TVD), startZ (North)

    const start = new THREE.Vector3(obstacle.startX, -obstacle.startY, -obstacle.startZ);

    let end: THREE.Vector3;
    if (obstacle.endX !== null && obstacle.endX !== undefined) {
        // Line segment obstacle
        end = new THREE.Vector3(
            obstacle.endX,
            -(obstacle.endY ?? obstacle.startY),
            -(obstacle.endZ ?? obstacle.startZ)
        );
    } else {
        // Point obstacle (vertical marker)
        // Treat as a vertical line segment 5ft tall? Or just a point?
        // Let's treat as a vertical segment for safety (e.g. manhole)
        end = start.clone().add(new THREE.Vector3(0, 5, 0));
    }

    // Distance from point to line segment
    const line = new THREE.Line3(start, end);
    const closestPoint = new THREE.Vector3();
    line.closestPointToPoint(point, true, closestPoint);

    return point.distanceTo(closestPoint);
};

export const checkCollision = (
    stations: SurveyStation[],
    obstacles: Obstacle[],
    warningThreshold: number = 10 // feet
): CollisionResult[] => {
    const results: CollisionResult[] = [];

    for (const station of stations) {
        const point = new THREE.Vector3(station.east, -station.tvd, -station.north);

        for (const obs of obstacles) {
            const centerDist = calculateDistanceToObstacle(point, obs);

            // Surface to surface distance
            // Borehole radius approx 0.5ft (1ft diam), Obstacle radius = diameter/2
            const obsRadius = (obs.diameter || 12) / 24; // diameter in inches -> radius in feet
            const minDist = centerDist - (0.5 + obsRadius);

            // Check against safety buffer if defined, else default threshold
            const threshold = obs.safetyBuffer || warningThreshold;

            if (minDist < threshold) {
                results.push({
                    obstacleId: obs.id,
                    obstacleType: obs.type,
                    distance: centerDist,
                    minDistance: minDist,
                    isCollision: minDist <= 0,
                    isWarning: minDist > 0 && minDist < threshold,
                    stationMd: station.md
                });
            }
        }
    }

    // Sort by danger (closest first)
    return results.sort((a, b) => a.minDistance - b.minDistance);
};
