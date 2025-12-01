
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seeding...');

    // 1. Clean up existing data (optional, but good for "Showcase Ready")
    // For now, we'll just add to it to avoid destroying anything critical if it exists.
    // But the prompt says "The app must never look empty", so let's ensure we have enough.

    // 2. Create Users
    console.log('Creating users...');

    const roles = ['OWNER', 'SUPER', 'CREW', 'CREW', 'CREW'];
    const users = [];

    for (const role of roles) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const email = faker.internet.email({ firstName, lastName }).toLowerCase();

        // Check if user exists to avoid duplicates on re-run
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            users.push(existingUser);
            continue;
        }

        const user = await prisma.user.create({
            data: {
                name: `${firstName} ${lastName}`,
                email,
                password: '$2a$10$EpIxT98hP76.G.O.X.O.X.O.X.O.X.O.X.O.X.O.X.O.X.O.X.O.X', // hash for 'password' (placeholder)
                role,
                phone: faker.phone.number(),
                avatar: faker.image.avatar(),
                createdAt: faker.date.past({ years: 2 }),
            },
        });
        users.push(user);
        console.log(`Created user: ${user.name} (${user.role})`);
    }

    // Ensure we have at least one admin for login if we didn't create one (e.g. if we skipped)
    let adminUser = users.find(u => u.role === 'OWNER');
    if (!adminUser) {
        // Fallback or find existing
        adminUser = await prisma.user.findFirst({ where: { role: 'OWNER' } }) || users[0];
    }


    // 3. Create Projects (50 Past, 5 Active)
    console.log('Creating projects...');
    const projectStatuses = ['COMPLETED', 'IN_PROGRESS', 'PLANNING'];

    // 50 Past Projects
    for (let i = 0; i < 50; i++) {
        const status = 'COMPLETED';
        const startDate = faker.date.past({ years: 2 });
        const endDate = faker.date.future({ years: 0.2, refDate: startDate });

        await prisma.project.create({
            data: {
                name: `${faker.location.city()} ${faker.commerce.productAdjective()} Install`,
                description: faker.lorem.sentence(),
                status,
                startDate,
                endDate,
                location: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()}`,
                customerName: faker.company.name(),
                customerContact: faker.person.fullName(),
                createdById: adminUser.id,
                createdAt: startDate,
            }
        });
    }

    // 5 Active Projects
    for (let i = 0; i < 5; i++) {
        const status = 'IN_PROGRESS';
        const startDate = faker.date.recent({ days: 30 });

        const project = await prisma.project.create({
            data: {
                name: `${faker.location.city()} Fiber Expansion`,
                description: `Active installation for ${faker.company.name()}`,
                status,
                startDate,
                location: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()}`,
                customerName: faker.company.name(),
                customerContact: faker.person.fullName(),
                createdById: adminUser.id,
                createdAt: startDate,
            }
        });

        // Create a Bore for active projects
        const bore = await prisma.bore.create({
            data: {
                projectId: project.id,
                name: 'Main Line 01',
                status: 'IN_PROGRESS',
                totalLength: faker.number.int({ min: 500, max: 2000 }),
                diameterIn: 4,
                productMaterial: 'HDPE',
                createdAt: startDate,
            }
        });

        // Create some Rod Passes for the active bore
        const numPasses = faker.number.int({ min: 5, max: 20 });
        for (let j = 1; j <= numPasses; j++) {
            await prisma.rodPass.create({
                data: {
                    boreId: bore.id,
                    sequence: j,
                    passNumber: 1, // Pilot
                    linearFeet: 15, // Standard rod length
                    pitch: faker.number.float({ min: -10, max: 10, fractionDigits: 1 }),
                    azimuth: faker.number.float({ min: 0, max: 360, fractionDigits: 1 }),
                    depth: j * 2, // Rough depth approx
                    loggedById: adminUser.id,
                    createdAt: faker.date.recent({ days: 1, refDate: startDate }),
                }
            });
        }

        console.log(`Created active project: ${project.name} with ${numPasses} rod passes.`);
    }

    console.log('✅ Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
