'use server';

import { prisma } from '@/lib/prisma';

export async function simulateDrillingData(boreId: string) {
    try {
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
                // Simulate other params
                wob: 15 + Math.random() * 5,
                rpm: 60 + Math.random() * 10,
                torque: 2500 + Math.random() * 500,
                pumpPressure: 800 + Math.random() * 100,
                flowRate: 150 + Math.random() * 20,
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Simulation Error:", error);
        return { success: false, error: 'Failed to simulate data' };
    }
}
