
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
    console.log('🚜 Starting Operational Data Seeding...');

    // 1. Fiber Project - Rod Passes
    const fiberProject = await prisma.project.findFirst({
        where: { name: { contains: 'Fiber Expansion' } },
        include: { bores: true }
    });

    if (fiberProject && fiberProject.bores.length > 0) {
        const bore = fiberProject.bores[0];
        console.log(`Seeding Rod Passes for Bore: ${bore.name}`);

        // Get an operator
        const operator = await prisma.user.findFirst({ where: { role: 'OPERATOR' } });
        const operatorId = operator?.id || fiberProject.createdById;

        // Create 30 rods (10ft or 15ft each)
        const rodLength = 15;
        let currentDepth = 0;
        let currentPitch = -10; // Start angling down
        let currentAzimuth = 90;

        for (let i = 1; i <= 30; i++) {
            // Simulate pitch changes
            if (i < 5) currentPitch += 0; // Hold angle
            else if (i < 10) currentPitch += 2; // Level out
            else if (i < 25) currentPitch = 0; // Flat
            else currentPitch += 2; // Steer up

            // Calculate depth (simplified)
            const depthChange = Math.sin(currentPitch * (Math.PI / 180)) * rodLength;
            currentDepth -= depthChange; // Depth increases as we go down (negative pitch?) 
            // Actually usually pitch down is negative, so depth increases. 
            // Let's assume positive depth is "below ground".
            // If pitch is -10 (down), sin(-10) is negative. 
            // So depth = oldDepth - (negative) = oldDepth + positive.

            await prisma.rodPass.create({
                data: {
                    boreId: bore.id,
                    sequence: i,
                    passNumber: 1, // Pilot
                    linearFeet: i * rodLength,
                    pitch: currentPitch,
                    azimuth: currentAzimuth,
                    depth: Math.abs(currentDepth), // Ensure positive
                    loggedById: operatorId,
                    createdAt: new Date(),
                    notes: i % 5 === 0 ? 'Smooth drilling' : null
                }
            });
        }
    }

    // 2. River Project - Telemetry Logs
    const riverProject = await prisma.project.findFirst({
        where: { name: { contains: 'River Crossing' } },
        include: { bores: true }
    });

    if (riverProject && riverProject.bores.length > 0) {
        const bore = riverProject.bores[0];
        console.log(`Seeding Telemetry for Bore: ${bore.name}`);

        // Generate 100 log entries over a few hours
        const startTime = new Date();
        startTime.setHours(startTime.getHours() - 4);

        for (let i = 0; i < 100; i++) {
            const time = new Date(startTime.getTime() + i * 2 * 60000); // Every 2 mins

            await prisma.telemetryLog.create({
                data: {
                    boreId: bore.id,
                    timestamp: time,
                    depth: 15 + Math.random() * 2, // Fluctuate slightly
                    pitch: 0 + (Math.random() - 0.5),
                    azimuth: 180 + (Math.random() - 0.5),
                    pumpPressure: 400 + Math.random() * 50,
                    flowRate: 45 + Math.random() * 5,
                    rpm: 120 + Math.random() * 10,
                    torque: 1500 + Math.random() * 200,
                    wob: 5000 + Math.random() * 1000
                }
            });
        }
    }

    console.log('✅ Operational Data Seeding Complete!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
