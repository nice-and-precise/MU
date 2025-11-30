import { SurveyStation } from "@/lib/drilling/types";

const RUST_ENGINE_URL = "http://localhost:8080";

interface SurveyInput {
    md: number;
    pitch: number;
    az: number;
}

interface PathPoint {
    north: number;
    east: number;
    tvd: number;
}

interface McmResponse {
    path: PathPoint[];
}

export async function calculatePathWithRust(surveys: SurveyInput[]): Promise<SurveyStation[]> {
    try {
        const response = await fetch(`${RUST_ENGINE_URL}/api/calculate/mcm`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ surveys }),
        });

        if (!response.ok) {
            throw new Error(`Rust Engine Error: ${response.statusText}`);
        }

        const data: McmResponse = await response.json();

        // Map back to SurveyStation
        // Note: Rust returns North/East/TVD. We need to merge with input MD/Inc/Az if we want full station data.
        // Or just return the coordinates.
        // The frontend expects SurveyStation which has all fields.

        return data.path.map((p, i) => ({
            measuredDepth: surveys[i].md,
            inclination: 90 + surveys[i].pitch, // Approx conversion back for display if needed
            azimuth: surveys[i].az,
            north: p.north,
            east: p.east,
            tvd: p.tvd,
            dls: 0, // Rust engine should calculate DLS too, but for now we didn't expose it in response
        }));

    } catch (error) {
        console.error("Failed to call Rust Engine:", error);
        // Fallback or rethrow?
        // For now, rethrow so UI knows
        throw error;
    }
}
