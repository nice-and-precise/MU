
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting data fabrication...');

    // 0. Clean Slate
    console.log('🧹 Clearing existing data...');
    // Delete children of User/Project first
    await prisma.estimateLine.deleteMany();
    await prisma.estimate.deleteMany();
    await prisma.reportAudit.deleteMany();
    await prisma.dailyReport.deleteMany();
    await prisma.rodPass.deleteMany();
    await prisma.telemetryLog.deleteMany();
    await prisma.fluidPlan.deleteMany();
    await prisma.borePlan.deleteMany();
    await prisma.photo.deleteMany();
    await prisma.event.deleteMany();
    await prisma.ticket811Response.deleteMany();
    await prisma.ticket811.deleteMany();
    await prisma.changeOrder.deleteMany();
    await prisma.tMTicket.deleteMany();
    await prisma.rFI.deleteMany();
    await prisma.correctiveAction.deleteMany();
    await prisma.inspection.deleteMany();
    await prisma.soilLayer.deleteMany();
    await prisma.geotechReport.deleteMany();
    await prisma.pit.deleteMany();
    await prisma.bore.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();


    // 1. Create Users
    console.log('👤 Creating users...');

    const owner = await prisma.user.upsert({
        where: { email: 'owner@mu.com' },
        update: {},
        create: {
            email: 'owner@mu.com',
            name: 'Robert "Bob" Vance',
            password: 'password123', // In real app, hash this
            role: 'OWNER',
            avatar: faker.image.avatar(),
            phone: faker.phone.number(),
        },
    });

    const superIntendent = await prisma.user.upsert({
        where: { email: 'mike@mu.com' },
        update: {},
        create: {
            email: 'mike@mu.com',
            name: 'Mike "Drillbit" O\'Connor',
            password: 'password123',
            role: 'SUPER',
            avatar: faker.image.avatar(),
            phone: faker.phone.number(),
        },
    });

    const crew = await prisma.user.upsert({
        where: { email: 'joe@mu.com' },
        update: {},
        create: {
            email: 'joe@mu.com',
            name: 'Joe "Rookie" Smith',
            password: 'password123',
            role: 'CREW',
            avatar: faker.image.avatar(),
            phone: faker.phone.number(),
        },
    });

    // 2. Create Projects
    console.log('🏗️ Creating projects...');

    // Past Project: Downtown Fiber Expansion
    const startDate = faker.date.past({ years: 1 });
    const endDate = faker.date.between({ from: startDate, to: new Date() });

    const pastProject = await prisma.project.create({
        data: {
            name: 'Downtown Fiber Expansion - Phase 1',
            description: 'Main street fiber backbone installation. Complex urban environment.',
            status: 'COMPLETED',
            startDate: startDate,
            endDate: endDate,
            location: 'Downtown Metro Area',
            customerName: 'Metro Communications',
            customerContact: 'Alice Johnson',
            createdById: owner.id,
            budget: 150000,
        },
    });
    const activeProject = await prisma.project.create({
        data: {
            name: 'River Crossing Upgrade',
            description: 'HDD crossing under the Mississippi River for gas pipeline.',
            status: 'IN_PROGRESS',
            startDate: faker.date.recent({ days: 30 }),
            location: 'North River Bank',
            customerName: 'Energy Corp',
            customerContact: 'Bill Davis',
            createdById: owner.id,
            budget: 450000,
        },
    });

    // 3. Create Bores & Logs for Past Project
    console.log('🕳️ Drilling holes (Past Project)...');

    const bore1 = await prisma.bore.create({
        data: {
            projectId: pastProject.id,
            name: 'Bore A-1',
            status: 'COMPLETED',
            totalLength: 500,
            diameterIn: 6,
            productMaterial: 'HDPE',
            entryPitId: null, // Simplified for seed
            exitPitId: null,
        },
    });

    // Generate Rod Passes for Bore A-1
    let currentDepth = 0;
    let currentPitch = -15; // Start angling down
    for (let i = 1; i <= 50; i++) { // 50 rods * 10ft = 500ft
        const rodLength = 10;
        currentDepth += rodLength * Math.sin((90 - currentPitch) * (Math.PI / 180)); // Rough calc

        // Simulate pitch leveling out
        if (i > 10 && i < 40) currentPitch += 0.5; // Level out
        if (i >= 40) currentPitch += 1; // Angle up

        await prisma.rodPass.create({
            data: {
                boreId: bore1.id,
                sequence: i,
                passNumber: 1, // Pilot
                linearFeet: i * rodLength,
                depth: Math.abs(currentDepth), // Depth is positive
                pitch: currentPitch,
                azimuth: 90 + (Math.random() * 2 - 1), // Slight wander around East
                loggedById: superIntendent.id,
                createdAt: faker.date.between({ from: pastProject.startDate!, to: pastProject.endDate! }),
            },
        });
    }

    // 4. Create Daily Reports for Past Project
    console.log('📝 Filing reports (Past Project)...');

    const days = 10;
    for (let i = 0; i < days; i++) {
        const reportDate = new Date(pastProject.startDate!);
        reportDate.setDate(reportDate.getDate() + i);

        await prisma.dailyReport.create({
            data: {
                projectId: pastProject.id,
                reportDate: reportDate,
                status: 'APPROVED',
                createdById: superIntendent.id,
                signedById: owner.id,
                signedAt: new Date(reportDate.getTime() + 86400000), // Signed next day


                notes: faker.lorem.sentence(),
            },
        });
    }

    // 5. Create Active Data for River Crossing
    console.log('🚧 Mobilizing active project...');

    const bore2 = await prisma.bore.create({
        data: {
            projectId: activeProject.id,
            name: 'River-X-1',
            status: 'IN_PROGRESS',
            totalLength: 1200,
            diameterIn: 12,
            productMaterial: 'Steel',
        },
    });

    // Create a few recent reports
    await prisma.dailyReport.create({
        data: {
            projectId: activeProject.id,
            reportDate: new Date(),
            status: 'DRAFT',
            createdById: superIntendent.id,

            notes: 'Mobilization complete. Setup drill rig.',
        },
    });

    console.log('✅ Data fabrication complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
