import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseWitsmlLog, parseWitsmlTrajectory } from '@/lib/drilling/witsml/parser';

export async function POST(req: NextRequest) {
    try {
        const boreId = req.nextUrl.searchParams.get('boreId');
        if (!boreId) {
            return NextResponse.json({ error: 'boreId is required' }, { status: 400 });
        }

        const xmlContent = await req.text();
        if (!xmlContent) {
            return NextResponse.json({ error: 'XML body is required' }, { status: 400 });
        }

        // Try parsing as Log first (Telemetry)
        const logData = parseWitsmlLog(xmlContent);

        if (logData.length > 0) {
            // Save to TelemetryLog
            const savedLogs = await prisma.telemetryLog.createMany({
                data: logData.map(d => ({
                    boreId,
                    timestamp: new Date(d.timestamp),
                    depth: d.depth,
                    pitch: d.pitch,
                    azimuth: d.azimuth,
                    // Map other fields if available in parser
                }))
            });
            return NextResponse.json({ success: true, type: 'log', count: savedLogs.count });
        }

        // If not log, try Trajectory (Survey)
        const trajData = parseWitsmlTrajectory(xmlContent);
        if (trajData.length > 0) {
            // For now, we might just log it or save to RodPass if needed.
            // But TelemetryLog is for real-time data.
            // Let's save to TelemetryLog as well for visualization?
            // Or maybe update the Bore's depthProfile?

            // For this iteration, let's focus on TelemetryLog from Logs.
            // But if we get trajectory, we can save it as TelemetryLog too?
            // Trajectory usually has MD, INC, AZI.

            const savedTraj = await prisma.telemetryLog.createMany({
                data: trajData.map(d => ({
                    boreId,
                    timestamp: new Date(), // Trajectory stations might not have timestamps, use current
                    depth: d.md,
                    pitch: d.incl,
                    azimuth: d.azi,
                }))
            });
            return NextResponse.json({ success: true, type: 'trajectory', count: savedTraj.count });
        }

        return NextResponse.json({ error: 'Could not parse WITSML data (neither Log nor Trajectory)' }, { status: 400 });

    } catch (error) {
        console.error('WITSML Ingestion Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
