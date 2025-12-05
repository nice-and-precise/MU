import { z } from 'zod';

export const AddProgressSchema = z.object({
    projectId: z.string().min(1, "Project ID is required"),
    startStation: z.number(),
    endStation: z.number(),
    status: z.string().min(1, "Status is required"),
    date: z.date(),
});

export type AddProgressInput = z.infer<typeof AddProgressSchema>;
