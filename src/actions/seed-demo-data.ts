'use server';

import { prisma } from '@/lib/prisma';
import { seed811Data } from './seed-811-data';
import { revalidatePath } from 'next/cache';

export async function seedFullDemoData() {
    try {
        console.log('Starting full demo seed...');

        // 1. Seed 811 Tickets
        await seed811Data();

        // 2. Seed Projects
        await seedProjects();

        // 3. Seed Assets
        await seedAssets();

        // 4. Seed Employees
        await seedEmployees();

        // 5. Seed Daily Reports (Historical)
        await seedDailyReports();

        revalidatePath('/');
        return { success: true, message: 'Full demo data seeded successfully!' };
    } catch (error) {
        console.error('Error seeding full demo data:', error);
        return { success: false, message: 'Failed to seed demo data.' };
    }
}

async function seedProjects() {
    const projects = [
        {
            name: 'Project Alpha - Fiber Build',
            status: 'IN_PROGRESS',
            description: 'Mainline fiber installation for downtown expansion.',
            location: 'Minneapolis, MN',
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Started 30 days ago
            budget: 150000,
            customerName: 'City Connect',
        },
        {
            name: 'Project Beta - Emergency Gas',
            status: 'IN_PROGRESS',
            description: 'Emergency gas line replacement.',
            location: 'St. Paul, MN',
            startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            budget: 45000,
            customerName: 'CenterPoint Energy',
        },
        {
            name: 'Project Gamma - Rural Water',
            status: 'PLANNING',
            description: 'Rural water main extension.',
            location: 'Rochester, MN',
            startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            budget: 250000,
            customerName: 'Rochester Public Utilities',
        }
    ];

    for (const p of projects) {
        const existing = await prisma.project.findFirst({ where: { name: p.name } });
        if (!existing) {
            await prisma.project.create({
                data: {
                    ...p,
                    createdById: 'demo-user-id', // Placeholder, ideally fetch a real user
                }
            });
        }
    }
}

async function seedAssets() {
    const assets = [
        { name: 'Drill #1 (D24x40)', type: 'Drill', status: 'ACTIVE', hourlyRate: 150 },
        { name: 'Drill #2 (D20x22)', type: 'Drill', status: 'MAINTENANCE', hourlyRate: 120 },
        { name: 'Truck #101', type: 'Vehicle', status: 'ACTIVE', hourlyRate: 85 },
        { name: 'Excavator E35', type: 'Equipment', status: 'ACTIVE', hourlyRate: 110 },
        { name: 'Vac Trailer V1', type: 'Trailer', status: 'ACTIVE', hourlyRate: 95 },
    ];

    for (const a of assets) {
        const existing = await prisma.asset.findFirst({ where: { name: a.name } });
        if (!existing) {
            await prisma.asset.create({ data: a as any });
        }
    }
}

async function seedEmployees() {
    const employees = [
        { firstName: 'John', lastName: 'Doe', role: 'FOREMAN', hourlyRate: 45, email: 'john.d@example.com' },
        { firstName: 'Jane', lastName: 'Smith', role: 'OPERATOR', hourlyRate: 38, email: 'jane.s@example.com' },
        { firstName: 'Bob', lastName: 'Jones', role: 'LABORER', hourlyRate: 25, email: 'bob.j@example.com' },
        { firstName: 'Mike', lastName: 'Wilson', role: 'LOCATOR', hourlyRate: 30, email: 'mike.w@example.com' },
    ];

    for (const e of employees) {
        const existing = await prisma.employee.findFirst({ where: { email: e.email } });
        if (!existing) {
            await prisma.employee.create({ data: e });
        }
    }
}

async function seedDailyReports() {
    // This requires existing projects and users, so we'd need to fetch them first.
    // For simplicity in this quick implementation, we'll skip complex relation mapping 
    // or assume we can find the ones we just created.

    const project = await prisma.project.findFirst({ where: { name: 'Project Alpha - Fiber Build' } });
    const user = await prisma.user.findFirst(); // Just grab the first user

    if (project && user) {
        const dates = [1, 2, 3, 4, 5];
        for (const d of dates) {
            const date = new Date(Date.now() - d * 24 * 60 * 60 * 1000);
            const existing = await prisma.dailyReport.findFirst({
                where: { projectId: project.id, reportDate: date }
            });

            if (!existing) {
                await prisma.dailyReport.create({
                    data: {
                        projectId: project.id,
                        reportDate: date,

                        createdById: user.id,
                        status: 'SUBMITTED'
                    }
                });
            }
        }
    }
}
