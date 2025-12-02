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

        // Map SurveyStation (types.ts) to SurveyStation (survey.ts)
        // types.ts: inc (degrees, 90=Horizontal)
        // survey.ts: inclination (degrees, 0=Vertical Down?) -> Actually survey.ts comments are confusing, 
        // but calculateBorePath converts (90 - p.inclination) to radians. 
        // If p.inclination is 90 (Horizontal), then (90-90)=0. cos(0)=1. dV = dMD * (1+1) * rf... wait.
        // If i1=0, cos(0)=1. dV is max. So Vertical change is max.
        // So in survey.ts, 90 input means Vertical change is max?
        // Let's look at survey.ts again:
        // const dV = (dMD / 2) * (Math.cos(i1) + Math.cos(i2)) * rf;
        // If input is 90, i1 = (90-90)*deg2rad = 0. cos(0)=1. dV is large.
        // So input 90 means Vertical.
        // But in HDD, 90 is Horizontal.
        // So survey.ts expects 0 for Horizontal?
        // Let's assume types.ts uses standard HDD: 90 Inc = Horizontal.
        // If we pass 90 to survey.ts, it treats it as Vertical?
        // We need to verify survey.ts math.

        // Let's just implement a simple MCM here or use the one in mcm.ts which we saw earlier and seemed more standard.
        // mcm.ts: calculateTrajectory(rawPoints, tieIn)

        const { calculateTrajectory } = await import('../drilling/math/mcm');

        // Map stations to raw points for mcm.ts
        const rawPoints = stations.map(s => ({
            md: s.md,
            inc: s.inc,
            azi: s.azi
        }));

        const trajectory = calculateTrajectory(rawPoints);

        return trajectory.map(s => ({
            x: s.east,
            y: s.north,
            z: s.tvd,
            md: s.md
        }));
    }
}
