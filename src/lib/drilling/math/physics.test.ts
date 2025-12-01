import { describe, it, expect } from 'vitest';
import { calculateCapstanLoad, calculateDetailedPullback } from './loads';
import { calculateDelftPMax, getSoilProperties, SoilLayerInput } from './hydraulics';
import { SurveyStation } from '../types';

describe('Physics Engine', () => {
    describe('Capstan Effect (ASTM F1962)', () => {
        it('should calculate exponential load increase', () => {
            const tensionIn = 1000;
            const mu = 0.3;
            const angleRad = Math.PI / 2; // 90 degrees

            // Expected: 1000 * e^(0.3 * 1.5708) = 1000 * 1.601 = 1601
            const expected = tensionIn * Math.exp(mu * angleRad);
            const result = calculateCapstanLoad(tensionIn, mu, angleRad);

            expect(result).toBeCloseTo(expected, 1);
            expect(result).toBeGreaterThan(tensionIn);
        });

        it('should handle straight sections (angle 0)', () => {
            const result = calculateCapstanLoad(1000, 0.3, 0);
            expect(result).toBe(1000);
        });
    });

    describe('Detailed Pullback Simulation', () => {
        it('should apply Capstan effect at bends', () => {
            // Mock Trajectory: 3 points. 
            // 0: Surface (Exit)
            // 1: 100ft down, straight
            // 2: 200ft down, 90 deg turn (impossible DLS but good for math check)

            const trajectory: SurveyStation[] = [
                { md: 0, inc: 0, azi: 0, tvd: 0, north: 0, east: 0 },
                { md: 100, inc: 0, azi: 0, tvd: 100, north: 0, east: 0, dls: 0 },
                { md: 200, inc: 90, azi: 0, tvd: 150, north: 50, east: 0, dls: 90 } // 90 deg turn over 100ft
            ];

            // Pipe: 6 inch HDPE (approx 5 lbs/ft net weight?)
            // Let's use the function defaults/logic

            const load = calculateDetailedPullback(
                trajectory,
                6, // diameter
                'HDPE',
                'Clay' // mu = 0.3
            );

            // Manual Calc Check:
            // Segment 1 (100-200): Length 100. Drag = 100 * (W_eff * 0.3 + Fluid). 
            // Then Capstan: Load * e^(0.3 * (90/100 * 100 * PI/180)) = Load * e^(0.3 * PI/2)
            // Segment 2 (0-100): Length 100. Drag added linearly.

            // We expect a significant load.
            expect(load).toBeGreaterThan(0);
        });
    });

    describe('Delft Cavity Expansion Model', () => {
        it('should calculate higher P_max for stronger soil', () => {
            const depth = 50;

            const weakSoilLayer: SoilLayerInput = {
                startDepth: 0, endDepth: 100, soilType: 'Clay', hardness: 1 // Soft
            };
            const strongSoilLayer: SoilLayerInput = {
                startDepth: 0, endDepth: 100, soilType: 'Clay', hardness: 10 // Hard
            };

            const weakProps = getSoilProperties(weakSoilLayer, depth);
            const strongProps = getSoilProperties(strongSoilLayer, depth);

            const pMaxWeak = calculateDelftPMax(depth, weakProps);
            const pMaxStrong = calculateDelftPMax(depth, strongProps);

            expect(pMaxStrong).toBeGreaterThan(pMaxWeak);
        });

        it('should account for friction angle in Sand', () => {
            const depth = 50;
            const sandLayer: SoilLayerInput = {
                startDepth: 0, endDepth: 100, soilType: 'Sand', hardness: 5
            };
            const props = getSoilProperties(sandLayer, depth);

            expect(props.internalFrictionAngleDeg).toBeGreaterThan(0);

            const pMax = calculateDelftPMax(depth, props);
            expect(pMax).toBeGreaterThan(0);
        });
    });
});
