
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Verifying Demo Data...');

    const activeProjects = await prisma.project.count({ where: { status: 'IN_PROGRESS' } });
    console.log(`Active Projects: ${activeProjects}`);

    const inventoryItems = await prisma.inventoryItem.findMany({
        select: { quantityOnHand: true, costPerUnit: true }
    });
    const inventoryValue = inventoryItems.reduce((acc, item) => acc + (item.quantityOnHand * (item.costPerUnit || 0)), 0);
    console.log(`Inventory Value: $${inventoryValue.toLocaleString()}`);

    const activeFleet = await prisma.asset.count({ where: { status: 'AVAILABLE' } });
    console.log(`Active Fleet: ${activeFleet}`);

    const openSafetyIssues = await prisma.correctiveAction.count({ where: { status: 'OPEN' } });
    console.log(`Open Safety Issues: ${openSafetyIssues}`);

    if (activeProjects > 0 && inventoryValue > 0 && activeFleet > 0) {
        console.log('✅ Data Verification PASSED');
    } else {
        console.error('❌ Data Verification FAILED: Missing data');
        process.exit(1);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
