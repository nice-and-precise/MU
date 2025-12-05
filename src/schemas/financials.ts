import { z } from "zod";

export const CreateTimeCardSchema = z.object({
    employeeId: z.string().min(1, "Employee ID is required"),
    projectId: z.string().min(1, "Project ID is required"),
    date: z.date(),
    entries: z.array(z.object({
        hours: z.number().min(0, "Hours cannot be negative"),
        code: z.string().min(1, "Code is required"),
        payrollItem: z.string().optional(),
        serviceItem: z.string().optional(),
        notes: z.string().optional(),
    })).min(1, "At least one entry is required"),
});

export type CreateTimeCardInput = z.infer<typeof CreateTimeCardSchema>;
