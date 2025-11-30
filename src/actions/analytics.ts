
'use server';

import { prisma } from '@/lib/prisma';

export interface ProductionRate {
    soilType: string;
    avgFtPerHour: number;
    sampleSizeFt: number;
}

/**
 * Mines Daily Reports to calculate actual production rates by soil type.
 * This creates the "Closed Loop" feedback for estimating.
 */
export async function getHistoricalProductionRates(): Promise<{ success: boolean, data?: ProductionRate[] }> {
    try {
        // 1. Fetch all Daily Reports with production logs
        const reports = await prisma.dailyReport.findMany({
            where: { status: 'APPROVED' }, // Only use approved data
            select: { production: true, projectId: true }
        });

        // 2. Aggregate data
        // We need to link production logs to soil types.
        // Since DailyReport production log is JSON and might not have soil type directly,
        // we have to infer it from the Project or Bore context.
        // For this implementation, we'll assume the Project has a dominant soil type 
        // or we'll look for "Soil Condition" notes in the report if available.

        // BETTER APPROACH: Fetch Projects with their Geotech Reports to map Project -> Soil
        const projects = await prisma.project.findMany({
            include: { geotechReports: { include: { soilLayers: true } } }
        });

        const projectSoilMap = new Map<string, string>();
        projects.forEach(p => {
            // Simplification: Take the most common soil layer or first one
            if (p.geotechReports.length > 0 && p.geotechReports[0].soilLayers.length > 0) {
                projectSoilMap.set(p.id, p.geotechReports[0].soilLayers[0].soilType);
            } else {
                projectSoilMap.set(p.id, 'Clay'); // Default
            }
        });

        const rates = new Map<string, { totalFt: number, totalHours: number }>();

        reports.forEach(report => {
            const soil = projectSoilMap.get(report.projectId) || 'Clay';

            try {
                const logs = JSON.parse(report.production as string);
                if (Array.isArray(logs)) {
                    logs.forEach((log: any) => {
                        // log: { boreId, activity, lf, startTime, endTime }
                        if (log.activity === 'Drill' || log.activity === 'Pilot') {
                            const lf = parseFloat(log.lf) || 0;
                            // Calculate hours
                            const start = new Date(`1970-01-01T${log.startTime}`);
                            const end = new Date(`1970-01-01T${log.endTime}`);
                            const hours = (end.getTime() - start.getTime()) / 3600000;

                            if (lf > 0 && hours > 0) {
                                const current = rates.get(soil) || { totalFt: 0, totalHours: 0 };
                                rates.set(soil, {
                                    totalFt: current.totalFt + lf,
                                    totalHours: current.totalHours + hours
                                });
                            }
                        }
                    });
                }
            } catch (e) {
                // Invalid JSON, skip
            }
        });

        // 3. Calculate Averages
        const results: ProductionRate[] = [];
        rates.forEach((value, key) => {
            results.push({
                soilType: key,
                avgFtPerHour: value.totalFt / value.totalHours,
                sampleSizeFt: value.totalFt
            });
        });

        // If no data, return industry defaults
        if (results.length === 0) {
            return {
                success: true, data: [
                    { soilType: 'Clay', avgFtPerHour: 40, sampleSizeFt: 0 }, // 400ft/day / 10hr
                    { soilType: 'Sand', avgFtPerHour: 30, sampleSizeFt: 0 },
                    { soilType: 'Rock', avgFtPerHour: 10, sampleSizeFt: 0 },
                ]
            };
        }

        return { success: true, data: results };

    } catch (error) {
        console.error('Failed to fetch historical rates:', error);
        return { success: false, error: 'Failed to fetch analytics' };
    }
}
