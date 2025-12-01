'use server';

import { prisma } from '@/lib/prisma';

export async function getLatestTelemetry(boreId: string) {
    try {
        const log = await prisma.telemetryLog.findFirst({
            where: { boreId },
            orderBy: { timestamp: 'desc' }
        });

        return { success: true, data: log };
    } catch (error) {
        console.error('Error fetching telemetry:', error);
        return { success: false, error: 'Failed to fetch telemetry' };
    }
}

export async function getTelemetryHistory(boreId: string, limit: number = 100) {
    try {
        const logs = await prisma.telemetryLog.findMany({
            where: { boreId },
            orderBy: { timestamp: 'desc' },
            take: limit
        });

        return { success: true, data: logs.reverse() }; // Return oldest first for charting
    } catch (error) {
        console.error('Error fetching telemetry history:', error);
        return { success: false, error: 'Failed to fetch telemetry history' };
    }
}
