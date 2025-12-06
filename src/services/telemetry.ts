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
    },

    simulateTelemetry: async (boreId: string) => {
        // Get the last log to increment from
        const lastLog = await prisma.telemetryLog.findFirst({
            where: { boreId },
            orderBy: { timestamp: 'desc' },
        });

        let newDepth = 0;
        let newPitch = 0;
        let newAzimuth = 0;

        if (lastLog) {
            newDepth = lastLog.depth + 0.5 + Math.random() * 0.5; // Advance 0.5-1.0 ft

            // Add some random walk to pitch and azimuth
            const pitchChange = (Math.random() - 0.5) * 0.5; // +/- 0.25 deg
            const aziChange = (Math.random() - 0.5) * 0.5; // +/- 0.25 deg

            newPitch = (lastLog.pitch || 0) + pitchChange;
            newAzimuth = (lastLog.azimuth || 0) + aziChange;
        } else {
            // Initial start
            newDepth = 10;
            newPitch = 0;
            newAzimuth = 0; // Due North
        }

        await prisma.telemetryLog.create({
            data: {
                boreId,
                timestamp: new Date(),
                depth: parseFloat(newDepth.toFixed(2)),
                pitch: parseFloat(newPitch.toFixed(2)),
                azimuth: parseFloat(newAzimuth.toFixed(2)),
                toolFace: Math.random() * 360, // Simulate tool rotation
                // Simulate other params
                wob: 15 + Math.random() * 5,
                rpm: 60 + Math.random() * 10,
                torque: 2500 + Math.random() * 500,
                pumpPressure: 800 + Math.random() * 100,
                flowRate: 150 + Math.random() * 20,
            }
        });
        return { success: true };
    },

    saveImportedLogs: async (boreId: string, logs: any[]) => {
        const data = logs.map(l => ({
            boreId,
            depth: l.md,
            pitch: l.inc,
            azimuth: l.azi,
            timestamp: new Date(), // Import time
            toolFace: 0,
            temp: 0,
            gamma: 0
        }));

        return await prisma.telemetryLog.createMany({
            data
        });
    }
};
