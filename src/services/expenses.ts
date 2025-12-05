import { prisma } from '@/lib/prisma';
import { CreateExpenseInput } from '@/schemas/expenses';

export class ExpensesService {
    static async createExpense(userId: string, data: CreateExpenseInput) {
        return await prisma.expense.create({
            data: {
                ...data,
                createdById: userId,
                status: 'APPROVED', // Default to APPROVED for now
            }
        });
    }

    static async getExpenses(projectId: string) {
        return await prisma.expense.findMany({
            where: { projectId },
            orderBy: { date: 'desc' },
            include: { createdBy: { select: { name: true } } }
        });
    }

    static async deleteExpense(id: string) {
        return await prisma.expense.delete({
            where: { id }
        });
    }
}
