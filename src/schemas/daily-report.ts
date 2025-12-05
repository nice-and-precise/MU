import { z } from 'zod';

export const CreateDailyReportSchema = z.object({
    projectId: z.string().min(1, "Project ID is required"),
    reportDate: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid date"),
    notes: z.string().optional(),
});

export const UpdateDailyReportSchema = z.object({
    crew: z.string().optional(), // JSON string
    production: z.string().optional(), // JSON string
    materials: z.string().optional(), // JSON string
    equipment: z.string().optional(), // JSON string
    weather: z.string().optional(), // JSON string
    notes: z.string().optional(),
});

export type CreateDailyReportInput = z.infer<typeof CreateDailyReportSchema>;
export type UpdateDailyReportInput = z.infer<typeof UpdateDailyReportSchema>;
