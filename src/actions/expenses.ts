'use server';

import { revalidatePath } from 'next/cache';
import { authenticatedAction, authenticatedActionNoInput } from '@/lib/safe-action';
import { CreateExpenseSchema } from '@/schemas/expenses';
import { ExpensesService } from '@/services/expenses';
import { z } from 'zod';

export const createExpense = authenticatedAction(
    CreateExpenseSchema,
    async (data, userId) => {
        const expense = await ExpensesService.createExpense(userId, data);
        revalidatePath(`/dashboard/projects/${data.projectId}/financials`);
        return expense;
    }
);

export const getExpenses = authenticatedAction(
    z.string(),
    async (projectId) => {
        return await ExpensesService.getExpenses(projectId);
    }
);

export const deleteExpense = authenticatedAction(
    z.object({
        id: z.string(),
        projectId: z.string() // Needed for revalidation
    }),
    async ({ id, projectId }) => {
        await ExpensesService.deleteExpense(id);
        revalidatePath(`/dashboard/projects/${projectId}/financials`);
        return { success: true };
    }
);
