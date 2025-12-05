import { z } from 'zod';

export const SubmitInspectionSchema = z.object({
    assetId: z.string(),
    // inspectorId: z.string(), // Injected
    projectId: z.string(),
    type: z.enum(['Pre-Trip', 'Post-Trip']),
    passed: z.boolean(),
    defects: z.array(z.string()),
    notes: z.string().optional(),
    odometer: z.number().optional(),
    engineHours: z.number().optional(),
});
