import { z } from 'zod';

export const BorePlanSchema = z.object({
    boreId: z.string().min(1, "Bore ID is required"),
    designMethod: z.string().optional(),
    totalLength: z.number().min(0, "Total length must be positive"),
    pipeDiameter: z.number().min(0, "Pipe diameter must be positive"),
    pipeMaterial: z.string().min(1, "Pipe material is required"),
    entryAngle: z.number().optional(),
    exitAngle: z.number().optional(),
    bendRadius: z.number().optional(),
    safetyFactor: z.number().optional(),
});

export const FluidPlanSchema = z.object({
    borePlanId: z.string().min(1, "Bore Plan ID is required"),
    soilType: z.string().min(1, "Soil type is required"),
    pumpRate: z.number().optional(),
    fluidType: z.string().optional(),
    additives: z.string().optional(),
    volumePerFt: z.number().optional(),
    totalVolume: z.number().optional(),
    cleaningRate: z.number().optional(),
});

export type BorePlanInput = z.infer<typeof BorePlanSchema>;
export type FluidPlanInput = z.infer<typeof FluidPlanSchema>;
