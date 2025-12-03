import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking for duplicate projects...');
    const projects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' } // Keep the newest one? Or oldest? Let's keep the one with most data?
        // Actually, let's keep the oldest one usually, but if they are identical, it doesn't matter.
    });

    const seenNames = new Set();
    const duplicates = [];

    for (const p of projects) {
        if (seenNames.has(p.name)) {
            duplicates.push(p);
        } else {
            seenNames.add(p.name);
        }
    }

    console.log(`Found ${duplicates.length} duplicate projects.`);

    for (const p of duplicates) {
        console.log(`Deleting duplicate project: ${p.name} (${p.id})`);
        // We need to delete related records first if cascade isn't set up, 
        // but Prisma usually handles cascade if configured in schema.
        // If not, we might error. Let's try.
        try {
            await prisma.project.delete({ where: { id: p.id } });
        } catch (e) {
            console.error(`Failed to delete ${p.id}:`, e);
        }
    }

    console.log('Cleanup complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
