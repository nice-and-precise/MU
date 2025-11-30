import { SurveyStation } from '../types';
import * as THREE from 'three';

export interface Obstacle {
    id: string;
    type: 'gas' | 'water' | 'electric' | 'fiber' | 'sewer' | 'abandoned';
    x: number;
    y: number;
    z: number;
    diameter: number;
    length: number;
    azimuth: number;
}

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
 * Assumes obstacle is a straight line segment for now.
 */
export const calculateDistanceToObstacle = (
    point: THREE.Vector3,
    obstacle: Obstacle
): number => {
    // Obstacle start point (using the same coordinate system as Borehole3D: x=East, y=-TVD, z=-North)
    // Note: Borehole3D renders with z = -North. 
    // Let's standardize on: x=East, y=TVD (depth positive down), z=North
    // But THREE.js usually uses Y up.
    // In Borehole3D: 
    // points = (east, -tvd, -north)
    // Obstacle pos = (x, -y, -z) -> (East, -TVD, -North)

    const obsStart = new THREE.Vector3(obstacle.x, -obstacle.y, -obstacle.z);

    // Calculate end point based on azimuth and length
    // Azimuth 0 = North (negative Z in 3D), 90 = East (positive X)
    const rad = (90 - obstacle.azimuth) * (Math.PI / 180); // Convert compass to trig angle
    // Actually, let's stick to the 3D world coordinates used in Borehole3D
    // Rot Y: 0 = North (-Z), 90 = West (-X)? 
    // Let's look at ObstacleMesh: rotation={[0, -obs.azimuth * (Math.PI / 180), 0]}
    // Cylinder is vertical by default? No, usually Y aligned.
    // If we rotate around Y, it stays in XZ plane?
    // Wait, cylinder geometry is vertical (Y axis).
    // If we rotate around Y, it just spins in place.
    // ObstacleMesh uses `rotation={[0, -obs.azimuth..., 0]}`. 
    // Wait, if cylinder is vertical, rotating around Y does nothing to its orientation in XZ plane.
    // It must be that the cylinder is rotated 90 deg to be horizontal first?
    // Let's check Borehole3D again.

    // In Borehole3D:
    // <cylinderGeometry args={[..., length, ...]} />
    // Default cylinder is along Y axis.
    // If we don't rotate X/Z, it's a vertical pipe (like a well).
    // But these are utilities, usually horizontal.
    // The code in Borehole3D doesn't rotate X to make it horizontal!
    // It only rotates Y.
    // So currently, all obstacles are VERTICAL pipes sticking out of the ground?
    // Let's check the visual.
    // If they are vertical, then azimuth rotation just spins them.

    // Correction: I need to fix ObstacleMesh to be horizontal first if they are pipelines.
    // But for the math, I will assume they are horizontal lines defined by start point and azimuth.

    // Let's assume for the math that we want to calculate distance to the infinite line defined by the obstacle,
    // clamped to the segment.

    // For this implementation, let's treat obstacles as Point Objects if length is small, or Lines if large.
    // Given the ambiguity in the current 3D rendering (which might be rendering vertical pipes), 
    // I will implement a robust "Point to Line Segment" distance function.

    // Re-deriving the 3D line segment:
    // Start: (x, -y, -z)
    // We need the direction vector.
    // Assuming horizontal pipe:
    // Azimuth 0 (North) -> Direction (0, 0, -1)
    // Azimuth 90 (East) -> Direction (1, 0, 0)
    const aziRad = obstacle.azimuth * (Math.PI / 180);
    const dirX = Math.sin(aziRad);
    const dirZ = -Math.cos(aziRad); // North is -Z

    const dir = new THREE.Vector3(dirX, 0, dirZ).normalize();
    const start = obsStart;
    const end = start.clone().add(dir.clone().multiplyScalar(obstacle.length));

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

    // Check every station (simple discrete check)
    // For better accuracy, we should check interpolated points, but this is a start.

    for (const station of stations) {
        const point = new THREE.Vector3(station.east, -station.tvd, -station.north);

        for (const obs of obstacles) {
            const centerDist = calculateDistanceToObstacle(point, obs);
            // Surface to surface distance
            // Borehole radius approx 0.5ft (1ft diam), Obstacle radius = diameter/2
            const minDist = centerDist - (0.5 + obs.diameter / 2);

            if (minDist < warningThreshold) {
                results.push({
                    obstacleId: obs.id,
                    obstacleType: obs.type,
                    distance: centerDist,
                    minDistance: minDist,
                    isCollision: minDist <= 0,
                    isWarning: minDist > 0 && minDist < warningThreshold,
                    stationMd: station.md
                });
            }
        }
    }

    // Sort by danger (closest first)
    return results.sort((a, b) => a.minDistance - b.minDistance);
};
