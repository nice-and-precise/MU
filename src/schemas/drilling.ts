import { z } from 'zod';

export const CreateBoreSchema = z.object({
    projectId: z.string(),
    name: z.string().min(1, "Bore name is required"),
    totalLength: z.number().optional()
});

export const AddRodPassSchema = z.object({
    boreId: z.string(),
    length: z.number(),
    pitch: z.number(),
    azimuth: z.number(),
    fluidMix: z.string().optional(),
    fluidVolume: z.number().optional(),
    viscosity: z.number().optional(),
    mudWeight: z.number().optional(),
    reamerDiameter: z.number().optional(),
    steeringToolFace: z.number().optional(),
    notes: z.string().optional()
});

export const GetBoreDetailsSchema = z.object({
    id: z.string()
});
