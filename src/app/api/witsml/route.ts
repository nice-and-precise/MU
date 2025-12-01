
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseWitsmlLog, parseWitsmlTrajectory } from '@/lib/drilling/witsml/parser';

/**
 * API Route for Real-Time WITSML / Drilling Data Ingestion
 * Accepts POST requests with drilling data (XML or JSON)
 */
export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get('content-type');
        let data: any[] = [];

        if (contentType?.includes('application/json')) {
            const body = await req.json();
            data = Array.isArray(body) ? body : [body];
        } else if (contentType?.includes('text/xml') || contentType?.includes('application/xml')) {
            const text = await req.text();

            // Try parsing as Log first
            let parsedLogs = parseWitsmlLog(text);

            // If no logs found, try parsing as Trajectory
            if (parsedLogs.length === 0) {
                const stations = parseWitsmlTrajectory(text);
                parsedLogs = stations.map(s => ({
                    timestamp: new Date().toISOString(), // Trajectory usually doesn't have timestamps per station, use current
                    depth: s.md,
                    // Note: WITSML Trajectory uses Inclination. Telemetry uses Pitch? 
                    // TelemetryLog has 'pitch'. If we store Inc as Pitch, we might confuse things.
                    // But 'pitch' in TelemetryLog usually means Inclination in some contexts or actual Pitch.
                    // Let's assume for now we map Inc -> Pitch.
                    // Ideally we should convert: Pitch = 90 - Inc (if Inc is 0-180).
                    // But let's check what TelemetryLog expects. 
                    // 'LiveTelemetryPage' displays Pitch. 
                    // If we send Inc (e.g. 90 for horizontal), and display it as Pitch, it's fine if the user expects Inc.
                    // But 'SteeringRose' expects Pitch (-90 to +90).
                    // So we should convert.
                    // Inc 90 -> Pitch 0. Inc 100 -> Pitch -10. Inc 80 -> Pitch +10.
                    // Pitch = 90 - Inc.
                    pitch: (90 - s.incl).toFixed(2),
                    azimuth: s.azi,
                    toolFace: 0, // Trajectory doesn't usually have toolface
                    rpm: 0,
                    wob: 0,
                    torque: 0,
                    pumpPressure: 0,
                    flowRate: 0
                }));
            }

            // Map WITSML to Telemetry format
            data = parsedLogs.map(l => ({
                boreId: 'UNKNOWN', // Placeholder, logic below will fix
                timestamp: l.timestamp,
                depth: l.depth,
                pitch: l.pitch,
                azimuth: l.azimuth,
                toolFace: l.toolFace,
                rpm: l.rpm,
                wob: l.wob,
                torque: l.torque,
                pumpPressure: l.pumpPressure,
                flowRate: l.flowRate
            }));
        }

        const results = [];
        const url = new URL(req.url);
        const queryBoreId = url.searchParams.get('boreId');

        for (const entry of data) {
            // Determine Bore ID
            // 1. Query Param
            // 2. Entry data
            // 3. Default/Fallback
            const boreId = queryBoreId || entry.boreId;

            if (!boreId || boreId === 'UNKNOWN') {
                // Try to find an active bore? 
                // For now, skip or log error.
                results.push({ error: 'Missing boreId' });
                continue;
            }

            // Ensure Bore Exists
            const bore = await prisma.bore.findUnique({ where: { id: boreId } });
            if (!bore) {
                results.push({ error: `Bore ${boreId} not found` });
                continue;
            }

            // Create Telemetry Log
            const log = await prisma.telemetryLog.create({
                data: {
                    boreId: bore.id,
                    timestamp: new Date(entry.timestamp || new Date()),
                    depth: typeof entry.depth === 'string' ? parseFloat(entry.depth) : entry.depth,
                    pitch: entry.pitch ? parseFloat(entry.pitch) : null,
                    azimuth: entry.azimuth ? parseFloat(entry.azimuth) : null,
                    toolFace: entry.toolFace ? parseFloat(entry.toolFace) : null,
                    rpm: entry.rpm ? parseFloat(entry.rpm) : null,
                    wob: entry.wob ? parseFloat(entry.wob) : null,
                    torque: entry.torque ? parseFloat(entry.torque) : null,
                    pumpPressure: entry.pumpPressure ? parseFloat(entry.pumpPressure) : null,
                    flowRate: entry.flowRate ? parseFloat(entry.flowRate) : null
                }
            });

            results.push({ success: true, id: log.id });
        }

        return NextResponse.json({ success: true, count: results.filter(r => r.success).length, results });

    } catch (error) {
        console.error('WITSML Ingestion Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
