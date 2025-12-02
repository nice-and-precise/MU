"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAuth } from "@/lib/auth-utils";

export async function getBore(boreId: string) {
    const session = await requireAuth();

    return await prisma.bore.findUnique({
        where: { id: boreId },
        select: {
            id: true,
            name: true,
            dip: true,
            declination: true,
            status: true,
            projectId: true,
            project: {
                select: {
                    obstacles: true
                }
            }
        }
    });
}

export async function saveImportedLogs(boreId: string, logs: any[]) {
    const session = await requireAuth();

    // Batch insert logs
    // Map fields to TelemetryLog model
    const data = logs.map(l => ({
        boreId,
        depth: l.md,
        pitch: l.inc,
        azimuth: l.azi,
        timestamp: new Date(), // Import time
        toolface: 0, // Default
        temp: 0,
        gamma: 0
    }));

    return await prisma.telemetryLog.createMany({
        data
    });
}
