import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { calculateDistanceToObstacle, checkCollision } from './collision';
import { SurveyStation, Obstacle } from '../../types';

describe('Collision Logic', () => {
    describe('calculateDistanceToObstacle', () => {
        it('should calculate distance to a point obstacle correctly', () => {
            // Obstacle at (10, 10, 10) - East, Depth, North
            const obstacle: Obstacle = {
                id: '1',
                name: 'Test Point',
                type: 'point',
                startX: 10,
                startY: 10, // Depth
                startZ: 10, // North
            };

            // Point at (10, 10, 10) in 3D space (East, -TVD, -North)
            // 3D Point: (10, -10, -10)
            const point = new THREE.Vector3(10, -10, -10);

            const distance = calculateDistanceToObstacle(point, obstacle);
            expect(distance).toBeCloseTo(0);
        });

        it('should calculate distance to a line obstacle correctly', () => {
            // Obstacle running East-West at Depth 10, North 10
            // From (0, 10, 10) to (20, 10, 10)
            const obstacle: Obstacle = {
                id: '2',
                name: 'Test Line',
                type: 'line',
                startX: 0,
                startY: 10,
                startZ: 10,
                endX: 20,
                endY: 10,
                endZ: 10,
            };

            // Point at (10, -10, -10) - Middle of the line
            const point = new THREE.Vector3(10, -10, -10);
            const distance = calculateDistanceToObstacle(point, obstacle);
            expect(distance).toBeCloseTo(0);

            // Point at (10, -20, -10) - 10 units below (deeper)
            // 3D Point: (10, -20, -10)
            // Obstacle Line: (0, -10, -10) to (20, -10, -10)
            // Distance should be 10
            const pointBelow = new THREE.Vector3(10, -20, -10);
            const distanceBelow = calculateDistanceToObstacle(pointBelow, obstacle);
            expect(distanceBelow).toBeCloseTo(10);
        });
    });

    describe('checkCollision', () => {
        it('should detect a collision', () => {
            const stations: SurveyStation[] = [
                { md: 0, inc: 0, azi: 0, tvd: 10, north: 10, east: 10 }, // Matches obstacle
            ];

            const obstacles: Obstacle[] = [
                {
                    id: '1',
                    name: 'Hit',
                    type: 'point',
                    startX: 10,
                    startY: 10,
                    startZ: 10,
                    diameter: 12, // 1ft
                    safetyBuffer: 5,
                }
            ];

            const results = checkCollision(stations, obstacles);
            expect(results.length).toBeGreaterThan(0);
            expect(results[0].isCollision).toBe(true);
        });

        it('should respect safety buffer', () => {
            // Station at (10, 12, 10) - 2ft deeper than obstacle at (10, 10, 10)
            const stations: SurveyStation[] = [
                { md: 0, inc: 0, azi: 0, tvd: 12, north: 10, east: 10 },
            ];

            const obstacles: Obstacle[] = [
                {
                    id: '1',
                    name: 'Near Miss',
                    type: 'point',
                    startX: 10,
                    startY: 10,
                    startZ: 10,
                    diameter: 0,
                    safetyBuffer: 5,
                }
            ];

            // Distance is 2ft. Buffer is 5ft. Should be warning, not collision.
            const results = checkCollision(stations, obstacles);
            expect(results.length).toBeGreaterThan(0);
            expect(results[0].isCollision).toBe(false);
            expect(results[0].isWarning).toBe(true);
        });
    });
});
