'use server';

import { prisma } from '@/lib/prisma';

export async function getLatestBoreTelemetry(input: { boreId: string }) {
    try {
        const latest = await prisma.telemetryLog.findFirst({
            where: { boreId: input.boreId },
            orderBy: { timestamp: 'desc' }
        });

        if (!latest) return { success: false, data: null };
        return { success: true, data: latest };
    } catch (error) {
        console.error("Fetch Telemetry Error:", error);
        return { success: false, error: 'Failed' };
    }
}
