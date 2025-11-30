
'use server';

import { prisma } from '@/lib/prisma';
import { calculateBorePath, generateDXF, SurveyStation } from '@/lib/drilling/math/survey';

export async function generateAsBuilt(boreId: string) {
    try {
        // 1. Fetch Bore and related Daily Reports
        const bore = await prisma.bore.findUnique({
            where: { id: boreId },
            include: {
                project: {
                    include: {
                        dailyReports: {
                            where: { status: 'APPROVED' },
                            orderBy: { reportDate: 'asc' }
                        }
                    }
                }
            }
        });

        if (!bore) {
            return { success: false, error: 'Bore not found' };
        }

        // 2. Extract Survey Stations from Daily Reports
        // We assume the 'production' JSON contains survey data if available
        // Format expected: { activity: 'Drill', lf: 10, pitch: 2.5, azimuth: 180, ... }
        const stations: SurveyStation[] = [];
        let currentDepth = 0;

        // Add start point
        stations.push({ measuredDepth: 0, inclination: 0, azimuth: 0 }); // Assuming horizontal start or 0 pitch

        bore.project.dailyReports.forEach(report => {
            try {
                const logs = JSON.parse(report.production as string);
                if (Array.isArray(logs)) {
                    logs.forEach((log: any) => {
                        if (log.boreId === boreId && (log.activity === 'Drill' || log.activity === 'Pilot')) {
                            const lf = parseFloat(log.lf) || 0;
                            const pitch = parseFloat(log.pitch) || 0;
                            const azimuth = parseFloat(log.azimuth) || 0;

                            if (lf > 0) {
                                currentDepth += lf;
                                stations.push({
                                    measuredDepth: currentDepth,
                                    inclination: pitch, // We'll convert this in the math lib
                                    azimuth: azimuth
                                });
                            }
                        }
                    });
                }
            } catch (e) {
                console.warn('Failed to parse production log for report:', report.id);
            }
        });

        if (stations.length < 2) {
            return { success: false, error: 'Insufficient survey data found in Daily Reports' };
        }

        // 3. Calculate 3D Path
        // We need a starting point. For now, assume (0,0,0) or use Bore entry pit location if available
        // TODO: Parse bore.entryPit.location if it exists (Lat/Lon) -> Local Grid
        const path = calculateBorePath(stations);

        // 4. Generate DXF
        const dxfContent = generateDXF(path);

        // 5. Return the DXF content (Client will handle download)
        // In a real app, we might save this to a file/blob storage and return a URL
        // For now, we return the string content
        return {
            success: true,
            data: {
                filename: `${bore.name.replace(/\s+/g, '_')}_AsBuilt.dxf`,
                content: dxfContent
            }
        };

    } catch (error) {
        console.error('Failed to generate As-Built:', error);
        return { success: false, error: 'Failed to generate As-Built' };
    }
}
