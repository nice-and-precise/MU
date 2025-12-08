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
                            orderBy: { reportDate: 'asc' },
                            include: { productionEntries: true }
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
            const logs = report.productionEntries || [];

            logs.forEach((log: any) => {
                // If the log is linked to a cost item or just general, we assume it's relevant if it has footage
                // We might need to check if it's Drill/Pilot/Ream based on description or separate field if we added one (we did not, just description/quantity)
                // For now, assume all footage entries contribute to depth if they are drilling
                if (log.quantity > 0) {
                    const lf = Number(log.quantity);
                    // Parse pitch/az from description or separate fields?
                    // We removed pitch/az from schema? NO, we keep them in 'description' or added them?
                    // Wait, schema check: DailyReportProduction has `quantity`, `unit`, `hours`, `description`, `costCode`.
                    // It does NOT have explicit pitch/az columns in the new schema?
                    // Let's check schema. if missing, we parse description.

                    // Actually, let's look at how we seed/save it.
                    // We save "Activity, Pitch: X, Az: Y" in description.
                    let pitch = 0;
                    let azimuth = 0;
                    if (log.description) {
                        const parts = log.description.split(',');
                        parts.forEach((p: string) => {
                            if (p.trim().startsWith('Pitch:')) pitch = parseFloat(p.split(':')[1]);
                            if (p.trim().startsWith('Az:')) azimuth = parseFloat(p.split(':')[1]);
                        });
                    }

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
