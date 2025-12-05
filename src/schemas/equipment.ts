import { z } from 'zod';

export const CreateAssetSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.string().min(1, "Type is required"),
    model: z.string().optional(),
    serialNumber: z.string().optional(),
    status: z.string().optional()
});

export const CreateMaintenanceLogSchema = z.object({
    assetId: z.string(),
    date: z.coerce.date(),
    type: z.string(),
    description: z.string(),
    cost: z.number().min(0),
    performedBy: z.string().optional()
});

export const GetMaintenanceLogsSchema = z.object({
    assetId: z.string()
});

export const CreateUsageLogSchema = z.object({
    assetId: z.string(),
    projectId: z.string(),
    date: z.coerce.date(),
    hours: z.number().min(0),
    notes: z.string().optional()
});
