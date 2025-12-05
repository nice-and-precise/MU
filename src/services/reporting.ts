import { prisma } from '@/lib/prisma';
import { calculateBorePath, generateDXF, SurveyStation } from '@/lib/drilling/math/survey';

export class ReportingService {

    static async generateAsBuilt(boreId: string) {
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
            throw new Error('Bore not found');
        }

        // 2. Extract Survey Stations from Daily Reports
        const stations: SurveyStation[] = [];
        let currentDepth = 0;

        // Add start point
        stations.push({ measuredDepth: 0, inclination: 0, azimuth: 0 });

        bore.project.dailyReports.forEach(report => {
            try {
                const logs = typeof report.production === 'string'
                    ? JSON.parse(report.production)
                    : report.production;

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
                                    inclination: pitch,
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
            throw new Error('Insufficient survey data found in Daily Reports');
        }

        // 3. Calculate 3D Path
        const path = calculateBorePath(stations);

        // 4. Generate DXF
        const dxfContent = generateDXF(path);

        return {
            filename: `${bore.name.replace(/\s+/g, '_')}_AsBuilt.dxf`,
            content: dxfContent
        };
    }
}
