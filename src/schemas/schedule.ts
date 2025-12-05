import { z } from 'zod';

export const GetShiftsSchema = z.object({
    start: z.union([z.string(), z.date()]).transform(val => new Date(val)),
    end: z.union([z.string(), z.date()]).transform(val => new Date(val)),
});

export const CreateShiftSchema = z.object({
    projectId: z.string().min(1, "Project is required"),
    crewId: z.string().optional(),
    employeeId: z.string().optional(),
    startTime: z.union([z.string(), z.date()]).transform(val => new Date(val)),
    endTime: z.union([z.string(), z.date()]).transform(val => new Date(val)),
    assetIds: z.array(z.string()).optional(),
    notes: z.string().optional(),
    force: z.boolean().optional(),
});

export const UpdateShiftSchema = z.object({
    id: z.string(),
    startTime: z.union([z.string(), z.date()]).transform(val => new Date(val)).optional(),
    endTime: z.union([z.string(), z.date()]).transform(val => new Date(val)).optional(),
    notes: z.string().optional(),
    status: z.string().optional(),
});

export const DeleteShiftSchema = z.object({
    id: z.string(),
});
