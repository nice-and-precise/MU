import { z } from 'zod';

export const CreateAssetSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.string().min(1, "Type is required"),
    model: z.string().optional().nullable(),
    serialNumber: z.string().optional().nullable(),
    status: z.enum(['Active', 'Maintenance', 'Retired']).default('Active'),
    projectId: z.string().optional().nullable(),
    purchaseDate: z.union([z.string(), z.date(), z.null()]).optional().transform(val => val ? new Date(val) : undefined),
    hours: z.number().optional().nullable(),
    location: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    hourlyRate: z.number().optional().nullable(),
});

export const UpdateAssetSchema = CreateAssetSchema.partial().extend({
    id: z.string().optional(),
});

export type CreateAssetInput = z.input<typeof CreateAssetSchema>;
export type UpdateAssetInput = z.input<typeof UpdateAssetSchema>;
