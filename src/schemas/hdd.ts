import { z } from 'zod';

export const CreateRodPassManualSchema = z.object({
    boreId: z.string(),
    sequence: z.number(),
    passNumber: z.number(),
    linearFeet: z.number(),
    depth: z.number(),
    pitch: z.number(),
    steerPosition: z.number().optional(), // Clock face 1-12
    pullbackForce: z.number().optional(),
    fluidMix: z.string().optional(),
    viscosity: z.number().optional(),
    returnsVisual: z.string().optional(),
    notes: z.string().optional(),
});

export const CreatePotholeSchema = z.object({
    projectId: z.string(),
    utilityType: z.string(),
    depth: z.number(),
    visualVerificationPhoto: z.string(),
    notes: z.string().optional(),
});
