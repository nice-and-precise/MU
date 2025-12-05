import { z } from 'zod';

export const CreateExpenseSchema = z.object({
    projectId: z.string().min(1, "Project ID is required"),
    date: z.date(),
    category: z.string().min(1, "Category is required"),
    description: z.string().min(1, "Description is required"),
    amount: z.number().min(0.01, "Amount must be positive"),
    vendor: z.string().optional(),
    receiptUrl: z.string().optional(),
});

export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;
