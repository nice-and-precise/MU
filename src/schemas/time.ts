import { z } from 'zod';

export const ClockInSchema = z.object({
    employeeId: z.string(),
    projectId: z.string().optional(),
    lat: z.number(),
    long: z.number(),
    type: z.enum(['WORK', 'TRAVEL', 'BREAK']).optional()
});

export const ClockOutSchema = z.object({
    employeeId: z.string(),
    lat: z.number(),
    long: z.number()
});

export const GetClockStatusSchema = z.string(); // employeeId
