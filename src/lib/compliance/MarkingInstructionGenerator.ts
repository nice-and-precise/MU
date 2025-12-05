import { get_marking_instructions } from '@/subterra-wasm/subterra';

interface Point {
    lat: number;
    lng: number;
}

export interface InstructionContext {
    geometry: any; // GeoJSON
    parcelAddress?: string;
    referencePoints?: { name: string; location: Point }[];
}

/**
 * Enhanced Marking Instruction Generator
 * wrappers the basic WASM generator but adds rich context like addresses and reference points.
 */
export async function generateRichMarkingInstructions(context: InstructionContext): Promise<string> {
    let basicInstruction = '';

    try {
        // Attempt to use WASM generator if available (and if geometry is compatible)
        // Convert GeoJSON to Float64Array expected by WASM if needed, or use a simplified centroid approach
        // For now, we assume basicInstruction logic is handled or we fallback to custom TS logic.
        // basicInstruction = get_marking_instructions(convertGeoJsonToFloat64(context.geometry));

        // Fallback for now since converting complex GeoJSON to flat Float64Array for the specific WASM signature
        // requires the exact polygon spec. Let's use a robust TS-based description.
        basicInstruction = `Excavate area defined by the attached polygon.`;
    } catch (e) {
        console.warn('WASM instruction generation failed, falling back to TS generator');
        basicInstruction = `Excavate area defined by the attached polygon.`;
    }

    const parts = [];

    // 1. Core Instruction
    parts.push(basicInstruction);

    // 2. Address Context
    if (context.parcelAddress) {
        parts.push(`Work is located at or near ${context.parcelAddress}.`);
    }

    // 3. Size/Shape Context
    // We could calculate area using Turf.js here if needed
    // const areaAcres = turf.area(context.geometry) ...

    // 4. Reference Points
    if (context.referencePoints && context.referencePoints.length > 0) {
        const refs = context.referencePoints.map(r => r.name).join(', ');
        parts.push(`Reference points: ${refs}.`);
    }

    // 5. Electronic Statement
    parts.push("See attached map for precise electronic white lining geometry.");

    return parts.join(' ');
}
