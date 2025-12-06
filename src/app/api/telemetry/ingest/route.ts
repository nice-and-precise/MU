import { NextRequest, NextResponse } from 'next/server';
import { TelemetryService } from '@/services/telemetry';
import { z } from 'zod';

const IngestSchema = z.object({
    boreId: z.string(),
    logs: z.array(z.object({
        timestamp: z.string().or(z.date()).transform(val => new Date(val)),
        depth: z.number(),
        pitch: z.number().optional(),
        azimuth: z.number().optional(),
        toolFace: z.number().optional(),
        rpm: z.number().optional(),
        wob: z.number().optional(),
        torque: z.number().optional(),
        pumpPressure: z.number().optional(),
        flowRate: z.number().optional(),
    }))
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parseResult = IngestSchema.safeParse(body);

        if (!parseResult.success) {
            return NextResponse.json(
                { error: 'Invalid payload', details: parseResult.error.format() },
                { status: 400 }
            );
        }

        const { boreId, logs } = parseResult.data;

        // In a real edge scenario, we might want to check an API key here
        // For now, we assume the edge device is trusted or inside the VPN

        await TelemetryService.ingestBatch(boreId, logs);

        return NextResponse.json({ success: true, count: logs.length });
    } catch (error) {
        console.error('Telemetry Ingest Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
