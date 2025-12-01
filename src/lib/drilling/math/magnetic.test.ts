import { describe, it, expect } from 'vitest';
import { calculateTrueAzimuth, calculateGridAzimuth, estimateInterferenceSeverity } from './magnetic';

describe('Magnetic Correction', () => {
    it('should calculate True Azimuth correctly', () => {
        // Declination East is positive
        const raw = 10;
        const declination = 5; // 5 deg East
        const expected = 15;
        expect(calculateTrueAzimuth(raw, declination)).toBe(expected);
    });

    it('should handle negative declination (West)', () => {
        const raw = 10;
        const declination = -5; // 5 deg West
        const expected = 5;
        expect(calculateTrueAzimuth(raw, declination)).toBe(expected);
    });

    it('should normalize azimuth > 360', () => {
        const raw = 355;
        const declination = 10;
        const expected = 5; // 365 % 360
        expect(calculateTrueAzimuth(raw, declination)).toBe(expected);
    });

    it('should normalize azimuth < 0', () => {
        const raw = 5;
        const declination = -10;
        const expected = 355; // -5 -> 355
        expect(calculateTrueAzimuth(raw, declination)).toBe(expected);
    });

    it('should calculate Grid Azimuth correctly', () => {
        const raw = 100;
        const params = {
            declination: 10, // +10
            gridConvergence: 2, // +2
            interferenceOffset: 0
        };
        // Grid = Mag + Dec - Conv
        // 100 + 10 - 2 = 108
        expect(calculateGridAzimuth(raw, params)).toBe(108);
    });

    it('should detect interference', () => {
        const expected = 50000; // nT
        const measured = 55000; // 10% deviation
        // Threshold is 5% (2500). Delta is 5000.
        // Severity = (5000 - 2500) / 2500 = 1.0
        expect(estimateInterferenceSeverity(measured, expected)).toBeCloseTo(1.0);
    });

    it('should ignore minor interference', () => {
        const expected = 50000;
        const measured = 51000; // 2% deviation
        expect(estimateInterferenceSeverity(measured, expected)).toBe(0);
    });
});
