
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * API Route for Real-Time WITSML / Drilling Data Ingestion
 * Accepts POST requests with drilling data (XML or JSON)
 */
export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get('content-type');
        let data: any;

        if (contentType?.includes('application/json')) {
            data = await req.json();
        } else if (contentType?.includes('text/xml') || contentType?.includes('application/xml')) {
            // TODO: Implement XML parsing for WITSML
            // For now, return not implemented for XML
            return NextResponse.json({ success: false, error: 'XML support pending' }, { status: 501 });
        } else {
            // Assume CSV or raw text
            const text = await req.text();
            // Simple CSV parser
            // Expected format: timestamp,boreId,depth,pitch,azimuth
            const lines = text.split('\n');
            data = lines.map(line => {
                const [timestamp, boreId, depth, pitch, azimuth] = line.split(',');
                return { timestamp, boreId, depth, pitch, azimuth };
            });
        }

        // Process Data
        // We expect an array of log entries
        const entries = Array.isArray(data) ? data : [data];
        const results = [];

        for (const entry of entries) {
            if (!entry.boreId || !entry.depth) continue;

            // Find or Create Daily Report for today
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const bore = await prisma.bore.findUnique({
                where: { id: entry.boreId },
                include: { project: true }
            });

            if (!bore) {
                results.push({ error: `Bore ${entry.boreId} not found` });
                continue;
            }

            // Find/Create Report
            let report = await prisma.dailyReport.findUnique({
                where: {
                    projectId_reportDate: {
                        projectId: bore.projectId,
                        reportDate: today
                    }
                }
            });

            if (!report) {
                // Find a user to attribute to (System or First Admin)
                const user = await prisma.user.findFirst(); // simplified
                if (!user) throw new Error('No user found');

                report = await prisma.dailyReport.create({
                    data: {
                        projectId: bore.projectId,
                        reportDate: today,
                        createdById: user.id,
                        crew: '[]',
                        status: 'DRAFT'
                    }
                });
            }

            // Append to Production Log
            const currentLogs = JSON.parse(report.production as string || '[]');

            // Check if this depth already exists to avoid dupes
            const exists = currentLogs.some((l: any) => l.lf === entry.depth && l.boreId === entry.boreId);

            if (!exists) {
                const newLog = {
                    boreId: entry.boreId,
                    activity: 'Drill',
                    lf: parseFloat(entry.depth), // This should be incremental LF, but input might be total depth. 
                    // For simplicity, assuming input is "Rod Length" or we calculate delta.
                    // Let's assume entry.depth is the rod length added.
                    pitch: parseFloat(entry.pitch),
                    azimuth: parseFloat(entry.azimuth),
                    startTime: new Date().toISOString().split('T')[1].substring(0, 5), // HH:MM
                    endTime: new Date().toISOString().split('T')[1].substring(0, 5)
                };

                currentLogs.push(newLog);

                await prisma.dailyReport.update({
                    where: { id: report.id },
                    data: { production: JSON.stringify(currentLogs) }
                });

                results.push({ success: true, id: report.id });
            } else {
                results.push({ skipped: true, reason: 'Duplicate' });
            }
        }

        return NextResponse.json({ success: true, results });

    } catch (error) {
        console.error('WITSML Ingestion Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
