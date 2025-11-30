
/**
 * Drilling Survey & As-Built Mathematics
 * Implements Minimum Curvature Method for 3D Bore Path Calculation
 */

export interface SurveyStation {
    measuredDepth: number; // ft
    inclination: number;   // degrees (0 = vertical down, 90 = horizontal) - Wait, in HDD 0 is usually horizontal? 
    // Standard Oilfield: 0=Vertical. HDD: 0=Horizontal usually.
    // Let's stick to standard HDD: 0 = Horizontal, +90 = Up, -90 = Down (Pitch)
    azimuth: number;       // degrees (0-360)
}

export interface Point3D {
    x: number; // Easting
    y: number; // Northing
    z: number; // Elevation (Depth is negative z, or just use Z)
    md: number;
}

/**
 * Converts HDD Pitch (degrees, +Up/-Down) to Oilfield Inclination (degrees, 0=Down)
 */
function pitchToInclination(pitch: number): number {
    return 90 - pitch;
}

/**
 * Calculates the 3D path using the Minimum Curvature Method
 * @param stations List of survey stations (MD, Pitch, Azimuth)
 * @param startPoint Starting coordinate (default 0,0,0)
 */
export function calculateBorePath(stations: SurveyStation[], startPoint: Point3D = { x: 0, y: 0, z: 0, md: 0 }): Point3D[] {
    const path: Point3D[] = [startPoint];

    for (let i = 1; i < stations.length; i++) {
        const p1 = stations[i - 1];
        const p2 = stations[i];

        // Convert HDD Pitch to Inclination (0 = Down) for standard MCM formula
        const i1 = (90 - p1.inclination) * (Math.PI / 180);
        const i2 = (90 - p2.inclination) * (Math.PI / 180);

        const a1 = p1.azimuth * (Math.PI / 180);
        const a2 = p2.azimuth * (Math.PI / 180);

        const dMD = p2.measuredDepth - p1.measuredDepth;

        // Dogleg Severity (Angle between two vectors)
        // cos(DL) = cos(I1)cos(I2) + sin(I1)sin(I2)cos(A2-A1)
        let dl = Math.acos(Math.cos(i1) * Math.cos(i2) + Math.sin(i1) * Math.sin(i2) * Math.cos(a2 - a1));

        // Ratio factor (RF) = 2/DL * tan(DL/2)
        // Handle small angles to avoid division by zero
        let rf = 1;
        if (dl > 0.0001) {
            rf = (2 / dl) * Math.tan(dl / 2);
        } else {
            rf = 1; // Straight line approximation
        }

        const dN = (dMD / 2) * (Math.sin(i1) * Math.cos(a1) + Math.sin(i2) * Math.cos(a2)) * rf;
        const dE = (dMD / 2) * (Math.sin(i1) * Math.sin(a1) + Math.sin(i2) * Math.sin(a2)) * rf;
        const dV = (dMD / 2) * (Math.cos(i1) + Math.cos(i2)) * rf; // Vertical Depth Change (Down is positive in this formula)

        const prev = path[path.length - 1];

        path.push({
            x: prev.x + dE,
            y: prev.y + dN,
            z: prev.z - dV, // In our system, Z is Elevation (Up is positive), so subtract dV
            md: p2.measuredDepth
        });
    }

    return path;
}

/**
 * Generates a simple DXF string for the bore path
 */
export function generateDXF(path: Point3D[]): string {
    let dxf = `0
SECTION
2
HEADER
0
ENDSEC
0
SECTION
2
ENTITIES
`;

    // Draw the path as a POLYLINE
    dxf += `0
POLYLINE
8
BORE_PATH
66
1
10
0.0
20
0.0
30
0.0
70
8
`;

    for (const p of path) {
        dxf += `0
VERTEX
8
BORE_PATH
10
${p.x.toFixed(4)}
20
${p.y.toFixed(4)}
30
${p.z.toFixed(4)}
70
32
`;
    }

    dxf += `0
SEQEND
0
ENDSEC
0
EOF
`;

    return dxf;
}
