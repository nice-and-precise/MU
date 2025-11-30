
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Cost Database...');

    // 1. Create Categories
    const categories = [
        { name: 'Labor', description: 'Crew wages and burden' },
        { name: 'Equipment', description: 'Drills, excavators, trucks' },
        { name: 'HDD Consumables', description: 'Fluids, tooling, pipe' },
        { name: 'Subcontractors', description: 'Hauling, traffic control, restoration' },
        { name: 'General Conditions', description: 'Permits, mobilization, overhead' },
    ];

    const categoryMap = new Map();

    for (const cat of categories) {
        const created = await prisma.costCategory.upsert({
            where: { name: cat.name },
            update: {},
            create: cat,
        });
        categoryMap.set(cat.name, created.id);
        console.log(`Created Category: ${cat.name}`);
    }

    // 2. Create Cost Items
    const items = [
        // Labor
        {
            code: 'LAB-001',
            name: 'Drill Foreman',
            unit: 'HR',
            unitCost: 85.00,
            category: 'Labor',
            laborRate: 85.00,
        },
        {
            code: 'LAB-002',
            name: 'Drill Operator',
            unit: 'HR',
            unitCost: 65.00,
            category: 'Labor',
            laborRate: 65.00,
        },
        {
            code: 'LAB-003',
            name: 'Locator',
            unit: 'HR',
            unitCost: 65.00,
            category: 'Labor',
            laborRate: 65.00,
        },
        {
            code: 'LAB-004',
            name: 'Laborer',
            unit: 'HR',
            unitCost: 45.00,
            category: 'Labor',
            laborRate: 45.00,
        },

        // Equipment
        {
            code: 'EQ-D24x40',
            name: 'Vermeer D24x40 Drill Rig',
            unit: 'HR',
            unitCost: 150.00,
            category: 'Equipment',
            equipmentRate: 150.00,
        },
        {
            code: 'EQ-D100x140',
            name: 'Vermeer D100x140 Drill Rig',
            unit: 'HR',
            unitCost: 450.00,
            category: 'Equipment',
            equipmentRate: 450.00,
        },
        {
            code: 'EQ-VAC',
            name: 'Vacuum Excavator (800 gal)',
            unit: 'HR',
            unitCost: 125.00,
            category: 'Equipment',
            equipmentRate: 125.00,
        },
        {
            code: 'EQ-MIX',
            name: 'Fluid Mixing System',
            unit: 'Day',
            unitCost: 200.00,
            category: 'Equipment',
            equipmentRate: 200.00,
        },

        // Consumables
        {
            code: 'MAT-BENT',
            name: 'Bentonite (50lb Bag)',
            unit: 'Bag',
            unitCost: 18.50,
            category: 'HDD Consumables',
            materialCost: 18.50,
        },
        {
            code: 'MAT-POLY',
            name: 'PHPA Polymer (5 gal)',
            unit: 'Pail',
            unitCost: 145.00,
            category: 'HDD Consumables',
            materialCost: 145.00,
        },
        {
            code: 'MAT-HDPE-2',
            name: '2" HDPE SDR11',
            unit: 'LF',
            unitCost: 2.10,
            category: 'HDD Consumables',
            materialCost: 2.10,
        },
        {
            code: 'MAT-HDPE-4',
            name: '4" HDPE SDR11',
            unit: 'LF',
            unitCost: 6.50,
            category: 'HDD Consumables',
            materialCost: 6.50,
        },
        {
            code: 'MAT-HDPE-12',
            name: '12" HDPE SDR11',
            unit: 'LF',
            unitCost: 28.00,
            category: 'HDD Consumables',
            materialCost: 28.00,
        },

        // General
        {
            code: 'GEN-MOB',
            name: 'Mobilization / Demobilization',
            unit: 'LS',
            unitCost: 2500.00,
            category: 'General Conditions',
        },
        {
            code: 'GEN-PERMIT',
            name: 'Permit Fees',
            unit: 'LS',
            unitCost: 500.00,
            category: 'General Conditions',
        },
    ];

    for (const item of items) {
        const catId = categoryMap.get(item.category);
        if (!catId) continue;

        await prisma.costItem.upsert({
            where: { code: item.code },
            update: {},
            create: {
                categoryId: catId,
                code: item.code,
                name: item.name,
                unit: item.unit,
                unitCost: item.unitCost,
                laborRate: item.laborRate,
                equipmentRate: item.equipmentRate,
                materialCost: item.materialCost,
            },
        });
        console.log(`Created Item: ${item.name}`);
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
