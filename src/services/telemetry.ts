import { prisma } from '@/lib/prisma';

export const TelemetryService = {
    getLatestTelemetry: async (boreId: string) => {
        return await prisma.telemetryLog.findFirst({
            where: { boreId },
            orderBy: { timestamp: 'desc' }
        });
    },

    getTelemetryHistory: async (boreId: string, limit: number = 100) => {
        const logs = await prisma.telemetryLog.findMany({
            where: { boreId },
            orderBy: { timestamp: 'desc' },
            take: limit
        });
        return logs.reverse();
    }
};
