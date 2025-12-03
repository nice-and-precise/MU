
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding River Crossing Scenario...");

    // 0. Ensure User Exists
    const user = await prisma.user.upsert({
        where: { email: "driller@example.com" },
        update: {},
        create: {
            email: "driller@example.com",
            name: "Chief Driller",
            password: "hashed_password_placeholder",
            role: "ADMIN"
        }
    });

    // 1. Create Project
    const project = await prisma.project.create({
        data: {
            name: "Mississippi River Crossing",
            location: "Baton Rouge, LA",
            status: "ACTIVE",
            description: "2000ft HDD crossing under the Mississippi River for 30-inch gas pipeline.",
            createdById: user.id
        }
    });

    console.log(`Created Project: ${project.name} (${project.id})`);

    // 2. Create Bore with Magnetic Params
    const bore = await prisma.bore.create({
        data: {
            projectId: project.id,
            name: "Main Crossing - Pilot",
            status: "DRILLING",
            totalLength: 2000,
            diameterIn: 12.25,
            dip: 60, // 60 degrees dip
            declination: 2.5, // 2.5 degrees East
        }
    });

    console.log(`Created Bore: ${bore.name} (${bore.id})`);

    // 3. Create Obstacles
    // River: 500ft wide, 50ft deep
    await prisma.obstacle.create({
        data: {
            projectId: project.id,
            name: "Mississippi River",
            type: "WATER",
            startX: 500, startY: 0, startZ: 0, // Surface
            endX: 1500, endY: 0, endZ: 0,
            safetyBuffer: 20
        }
    });

    // Existing Pipeline
    await prisma.obstacle.create({
        data: {
            projectId: project.id,
            name: "Existing 12-inch Oil",
            type: "OIL",
            startX: 1200, startY: 0, startZ: 80, // 80ft deep
            endX: 1200, endY: 100, endZ: 80, // Crossing perpendicular
            diameter: 12,
            safetyBuffer: 10
        }
    });

    console.log("Created Obstacles");

    // 4. Generate Telemetry Logs (Simulate Drilling)
    // Path: Entry (0,0) -> Build to 12 deg -> Hold -> Drop -> Exit
    const logs = [];
    const currentDepth = 0;
    let currentPitch = 0; // Starts horizontal? No, entry angle usually.
    // Let's say entry angle is 12 deg (Pitch = -12? or +12? Down is usually negative pitch in some conventions, or positive inclination)
    // In our system: Pitch 0 = Horizontal. + = Up, - = Down.
    // Entry is down, so Pitch = -12.
    currentPitch = -12;
    let currentAzimuth = 90; // East

    // Drilling 1000ft so far
    for (let i = 0; i < 100; i++) {
        const md = i * 10; // 10ft intervals

        // Logic:
        // 0-200ft: Hold -12
        // 200-500ft: Build to 0 (Horizontal)
        // 500-800ft: Hold 0
        // 800-1000ft: Build to +12 (Exit)

        let targetPitch = -12;
        if (md > 200 && md <= 500) {
            // Build from -12 to 0 over 300ft. 
            // Rate = 12 deg / 300ft = 0.04 deg/ft = 4 deg/100ft
            const progress = (md - 200) / 300;
            targetPitch = -12 + (12 * progress);
        } else if (md > 500 && md <= 800) {
            targetPitch = 0;
        } else if (md > 800) {
            // Build from 0 to +12
            const progress = (md - 800) / 300;
            targetPitch = 12 * progress;
        }

        // Add noise
        const noisePitch = (Math.random() - 0.5) * 0.5;
        const noiseAzi = (Math.random() - 0.5) * 1.0;

        currentPitch = targetPitch + noisePitch;
        currentAzimuth = 90 + noiseAzi;

        logs.push({
            boreId: bore.id,
            depth: md,
            pitch: currentPitch,
            azimuth: currentAzimuth,
            timestamp: new Date(Date.now() - (1000 - i) * 60000) // Past timestamps
        });
    }

    await prisma.telemetryLog.createMany({
        data: logs
    });

    console.log(`Generated ${logs.length} Telemetry Logs`);
    console.log("Seeding Complete!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
