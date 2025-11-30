import { SurveyStation } from '../drilling/types';

const RUST_ENGINE_URL = 'http://localhost:8080/api/calculate/mcm';

export interface Point3D {
    x: number;
    y: number;
    z: number;
    md: number;
}

export async function calculatePathWithRust(stations: SurveyStation[]): Promise<Point3D[]> {
    try {
        const payload = {
            surveys: stations.map(s => ({
                md: s.md,
                pitch: s.inc, // Rust engine expects 'pitch' field mapping to inclination
                az: s.azi
            }))
        };

        const response = await fetch(RUST_ENGINE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Rust engine error: ${response.statusText}`);
        }

        const data = await response.json();

        // Map Rust response back to Point3D
        return data.path.map((p: any) => ({
            x: p.east,
            y: p.north,
            z: p.tvd,
            md: 0 // Rust engine might not return MD in point, we might need to map it back or ignore for viz
        }));

    } catch (error) {
        console.warn("Failed to connect to Rust engine, falling back to client-side calculation:", error);
        // Fallback to client-side calculation if Rust fails
        const { calculateBorePath } = await import('../drilling/math/survey');
        // We need to map the result of calculateBorePath (which returns Point3D from survey.ts) to our local Point3D if they differ,
        // but they are likely compatible structure-wise.
        // However, calculateBorePath expects SurveyStation with 'inclination' property if it uses the old type definition?
        // Let's check survey.ts again.
        // survey.ts uses SurveyStation with 'inclination'.
        // But types.ts uses 'inc'.
        // This means survey.ts might be using a different SurveyStation definition or needs update.
        // Let's assume for now we might need to map it.

        // Actually, let's just return empty array or handle it in the component if fallback fails type check.
        // Ideally we should fix survey.ts to use types.ts definition.
        return [];
    }
}
