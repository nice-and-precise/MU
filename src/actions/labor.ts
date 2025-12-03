'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// --- Employees & Crews ---
// Moved to src/actions/employees.ts and src/actions/crews.ts
// Keeping Time Cards here for now until Phase 2


// --- Time Cards ---

export async function createTimeCard(data: {
    employeeId: string;
    projectId: string;
    date: Date;
    hours: number;
    code: string;
    notes?: string
}) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        // Calculate period start (Monday) and end (Sunday)
        const d = new Date(data.date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const periodStart = new Date(d.setDate(diff));
        const periodEnd = new Date(d.setDate(diff + 6));

        const timeCard = await prisma.timeCard.create({
            data: {
                employeeId: data.employeeId,
                projectId: data.projectId,
                date: data.date,
                hours: data.hours,
                code: data.code,
                notes: data.notes,
                periodStart,
                periodEnd,
            }
        });
        revalidatePath(`/dashboard/projects/${data.projectId}`);
        return { success: true, data: timeCard };
    } catch (error) {
        console.error('Failed to create time card:', error);
        return { success: false, error: 'Failed to create time card' };
    }
}

export async function getTimeCards(projectId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return [];
    return await prisma.timeCard.findMany({
        where: { projectId },
        include: { employee: true },
        orderBy: { date: 'desc' }
    });
}
