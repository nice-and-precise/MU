import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        // Find or create a user
        const user = await prisma.user.upsert({
            where: { email: 'test@example.com' },
            update: {},
            create: {
                email: 'test@example.com',
                password: 'hashedpassword', // Insecure but fine for test
                name: 'Test User',
                role: 'OWNER'
            }
        });

        // Create a project
        const project = await prisma.project.create({
            data: {
                name: 'WITSML Verification Project',
                status: 'PLANNING',
                createdById: user.id
            }
        });

        // Create a bore
        const bore = await prisma.bore.create({
            data: {
                projectId: project.id,
                name: 'Test Bore 1',
                status: 'PLANNED'
            }
        });

        console.log(bore.id);
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
