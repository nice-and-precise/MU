/**
 * Magnetic Interference and Correction Utilities
 * 
 * Handles conversion from Magnetic North to True North and Grid North.
 * Also provides basic compensation for magnetic interference.
 */

export interface MagneticParams {
    declination: number; // Degrees (+ East, - West)
    gridConvergence: number; // Degrees (+ East, - West)
    interferenceOffset?: number; // Degrees (Local magnetic anomaly)
}

/**
 * Calculates True Azimuth from Raw Magnetic Azimuth
 * True Azimuth = Magnetic Azimuth + Declination
 */
export function calculateTrueAzimuth(rawAzimuth: number, declination: number): number {
    const trueAzimuth = rawAzimuth + declination;
    return normalizeAzimuth(trueAzimuth);
}

/**
 * Calculates Grid Azimuth from Raw Magnetic Azimuth
 * Grid Azimuth = Magnetic Azimuth + Declination - Grid Convergence
 * (Simplified formula)
 */
export function calculateGridAzimuth(rawAzimuth: number, params: MagneticParams): number {
    const { declination, gridConvergence, interferenceOffset = 0 } = params;
    const gridAzimuth = rawAzimuth + declination - gridConvergence + interferenceOffset;
    return normalizeAzimuth(gridAzimuth);
}

/**
 * Normalizes azimuth to 0-360 range
 */
function normalizeAzimuth(azimuth: number): number {
    let normalized = azimuth % 360;
    if (normalized < 0) normalized += 360;
    return normalized;
}

/**
 * Estimates Magnetic Interference based on Total Magnetic Field (B_total)
 * If B_total deviates significantly from expected local field, interference is likely.
 * 
 * @param measuredBTotal Measured Total Magnetic Field (Gauss or nT)
 * @param expectedBTotal Expected Total Magnetic Field (from IGRF model)
 * @returns Interference severity (0-1)
 */
export function estimateInterferenceSeverity(measuredBTotal: number, expectedBTotal: number): number {
    const delta = Math.abs(measuredBTotal - expectedBTotal);
    const threshold = expectedBTotal * 0.05; // 5% tolerance

    if (delta < threshold) return 0;

    // Linear scaling of severity above threshold
    const severity = Math.min((delta - threshold) / threshold, 1);
    return severity;
}
