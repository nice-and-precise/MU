import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const project = await prisma.project.findFirst({
        include: { bores: true }
    });
    if (project) {
        console.log(`Project ID: ${project.id}`);
        console.log(`Project Name: ${project.name}`);
        if (project.bores.length > 0) {
            console.log(`Bore ID: ${project.bores[0].id}`);
        } else {
            console.log("No bores found for this project.");
        }
    } else {
        console.log("No projects found.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
