import { z } from 'zod';

export const CreateTimeCardSchema = z.object({
    employeeId: z.string(),
    projectId: z.string(),
    date: z.coerce.date(),
    hours: z.number(),
    code: z.string(),
    notes: z.string().optional()
});
