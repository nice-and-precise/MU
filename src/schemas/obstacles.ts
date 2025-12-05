import { z } from 'zod';

export const CreateObstacleSchema = z.object({
    projectId: z.string(),
    name: z.string(),
    type: z.string(),
    startX: z.number().or(z.string().transform(Number)),
    startY: z.number().or(z.string().transform(Number)),
    startZ: z.number().or(z.string().transform(Number)),
    endX: z.number().or(z.string().transform(Number)).optional().nullable(),
    endY: z.number().or(z.string().transform(Number)).optional().nullable(),
    endZ: z.number().or(z.string().transform(Number)).optional().nullable(),
    diameter: z.number().or(z.string().transform(Number)).optional().nullable(),
    safetyBuffer: z.number().or(z.string().transform(Number)).optional().default(2.0),
    notes: z.string().optional(),
});
