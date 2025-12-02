'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const expenseSchema = z.object({
    projectId: z.string(),
    date: z.date(),
    category: z.string(),
    description: z.string(),
    amount: z.number(),
    vendor: z.string().optional(),
    receiptUrl: z.string().optional(),
});

export async function createExpense(data: z.infer<typeof expenseSchema>) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const expense = await prisma.expense.create({
            data: {
                ...data,
                createdById: session.user.id,
                status: 'APPROVED', // Auto-approve for now, or 'PENDING' if we want a workflow
            }
        });

        revalidatePath(`/dashboard/projects/${data.projectId}/financials`);
        return { success: true, data: expense };
    } catch (error) {
        console.error('Failed to create expense:', error);
        return { success: false, error: 'Failed to create expense' };
    }
}

export async function getExpenses(projectId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return [];

    return await prisma.expense.findMany({
        where: { projectId },
        orderBy: { date: 'desc' },
        include: { createdBy: { select: { name: true } } }
    });
}

export async function deleteExpense(id: string, projectId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        await prisma.expense.delete({ where: { id } });
        revalidatePath(`/dashboard/projects/${projectId}/financials`);
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete expense' };
    }
}
