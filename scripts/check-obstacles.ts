
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const project = await prisma.project.findFirst({
        where: { status: 'IN_PROGRESS' },
        include: { obstacles: true }
    });

    if (!project) {
        console.log('No active project found.');
        return;
    }

    console.log(`Project: ${project.name}`);
    console.log(`Obstacles: ${project.obstacles.length}`);

    if (project.obstacles.length === 0) {
        console.log('Adding demo obstacles...');
        await prisma.obstacle.createMany({
            data: [
                {
                    projectId: project.id,
                    name: 'Existing Gas Line',
                    type: 'Gas',
                    startX: 0, startY: 10, startZ: 5,
                    endX: 100, endY: 15, endZ: 5,
                    diameter: 4,
                    safetyBuffer: 2
                },
                {
                    projectId: project.id,
                    name: 'Water Main',
                    type: 'Water',
                    startX: 20, startY: -10, startZ: 8,
                    endX: 80, endY: 20, endZ: 8,
                    diameter: 8,
                    safetyBuffer: 2
                }
            ]
        });
        console.log('Added 2 obstacles.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
