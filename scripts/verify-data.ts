
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Starting Backend Data Verification...');
    let errors = 0;

    // 1. Verify Users
    const userCount = await prisma.user.count();
    console.log(`Users found: ${userCount}`);
    if (userCount < 6) {
        console.error('❌ Error: Expected at least 6 users (Owner, Super, Foreman, Operator, Laborer, Mechanic)');
        errors++;
    } else {
        console.log('✅ Users check passed');
    }

    // 2. Verify Projects
    const projects = await prisma.project.findMany({ include: { dailyReports: true, bores: true } });
    console.log(`Projects found: ${projects.length}`);

    const fiberProject = projects.find(p => p.name.includes('Fiber Expansion'));
    if (!fiberProject) {
        console.error('❌ Error: "Fiber Expansion" project not found');
        errors++;
    } else {
        console.log('✅ Fiber Project found');

        // Check Reports
        if (fiberProject.dailyReports.length < 5) {
            console.error(`❌ Error: Expected at least 5 daily reports, found ${fiberProject.dailyReports.length}`);
            errors++;
        } else {
            console.log(`✅ Daily Reports check passed (${fiberProject.dailyReports.length})`);
        }

        // Check Bores
        if (fiberProject.bores.length === 0) {
            console.error('❌ Error: No bores found for Fiber Project');
            errors++;
        } else {
            console.log(`✅ Bores check passed (${fiberProject.bores.length})`);
        }
    }

    // 3. Verify Inventory
    const inventoryCount = await prisma.inventoryItem.count();
    console.log(`Inventory Items found: ${inventoryCount}`);
    if (inventoryCount === 0) {
        console.error('❌ Error: Inventory is empty');
        errors++;
    } else {
        console.log('✅ Inventory check passed');
    }

    // 4. Verify Fleet
    const assetCount = await prisma.asset.count();
    console.log(`Assets found: ${assetCount}`);
    if (assetCount === 0) {
        console.error('❌ Error: Fleet is empty');
        errors++;
    } else {
        console.log('✅ Fleet check passed');
    }

    // 5. Verify Safety
    const jsaCount = await prisma.jSA.count();
    console.log(`JSAs found: ${jsaCount}`);
    if (jsaCount === 0) {
        console.error('❌ Error: No JSAs found');
        errors++;
    } else {
        console.log('✅ Safety check passed');
    }

    if (errors > 0) {
        console.error(`\n❌ Verification FAILED with ${errors} errors.`);
        process.exit(1);
    } else {
        console.log('\n✅ All Backend Verification Checks PASSED!');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
