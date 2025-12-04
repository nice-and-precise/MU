
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
    console.log('💰 Starting Financial Data Seeding...');

    // 1. Get Projects & Cost Items
    const projects = await prisma.project.findMany({
        where: { status: { in: ['IN_PROGRESS', 'PLANNING', 'COMPLETED'] } }
    });
    const costItems = await prisma.costItem.findMany();
    const owner = await prisma.user.findFirst({ where: { role: 'OWNER' } });

    if (projects.length === 0 || costItems.length === 0) {
        console.log('Missing projects or cost items. Run base seed first.');
        return;
    }

    // 2. Create Estimates for each project
    for (const project of projects) {
        console.log(`Creating Estimate for: ${project.name}`);

        const estimate = await prisma.estimate.create({
            data: {
                projectId: project.id,
                name: `Estimate for ${project.name}`,
                status: 'APPROVED',
                customerName: project.customerName,
                createdById: owner?.id || project.createdById,
                subtotal: 0,
                total: 0
            }
        });

        // Add Lines
        let subtotal = 0;
        const numLines = Math.floor(Math.random() * 5) + 3; // 3-8 lines

        for (let i = 0; i < numLines; i++) {
            const item = costItems[Math.floor(Math.random() * costItems.length)];
            const qty = Math.floor(Math.random() * 50) + 10;
            const lineTotal = qty * item.unitCost;

            await prisma.estimateLine.create({
                data: {
                    estimateId: estimate.id,
                    costItemId: item.id,
                    lineNumber: i + 1,
                    description: item.name,
                    quantity: qty,
                    unit: item.unit,
                    unitCost: item.unitCost,
                    subtotal: lineTotal,
                    total: lineTotal, // Simplified markup
                    laborCost: item.categoryId.includes('Labor') ? lineTotal : 0,
                    equipmentCost: item.categoryId.includes('Equipment') ? lineTotal : 0,
                    materialCost: item.categoryId.includes('Materials') ? lineTotal : 0,
                }
            });
            subtotal += lineTotal;
        }

        // Update Estimate Totals
        await prisma.estimate.update({
            where: { id: estimate.id },
            data: {
                subtotal: subtotal,
                total: subtotal * 1.15 // 15% markup
            }
        });
    }

    // 3. Create Expenses (More detailed than base seed)
    console.log('Creating detailed Expenses...');
    const expenseCategories = ['Fuel', 'Per Diem', 'Materials', 'Repairs', 'Lodging', 'Subcontractor'];

    for (const project of projects) {
        const numExpenses = Math.floor(Math.random() * 10) + 5;
        for (let i = 0; i < numExpenses; i++) {
            await prisma.expense.create({
                data: {
                    projectId: project.id,
                    date: faker.date.recent({ days: 60 }),
                    category: faker.helpers.arrayElement(expenseCategories),
                    amount: parseFloat(faker.commerce.price({ min: 50, max: 2000 })),
                    vendor: faker.company.name(),
                    description: faker.lorem.sentence(),
                    status: 'APPROVED',
                    createdById: owner?.id || project.createdById
                }
            });
        }
    }

    console.log('✅ Financial Data Seeding Complete!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
