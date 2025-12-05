import { z } from 'zod';

export const SaveRodPlanSchema = z.object({
    projectId: z.string(),
    rods: z.array(z.any()), // Structurally complex, keeping as any or generic object array for now
    settings: z.object({
        diameter: z.number().optional(),
        material: z.string().optional(),
        declination: z.number().optional(),
        soil: z.string().optional(),
    }),
});
