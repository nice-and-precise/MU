
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { calculatePullbackForce } from '@/lib/drilling/math/loads';
import { analyzeFracOutRisk, SoilLayerInput } from '@/lib/drilling/math/hydraulics';

const BorePlanSchema = z.object({
    boreId: z.string(),
    designMethod: z.string().optional(),
    totalLength: z.number(),
    pipeDiameter: z.number(),
    pipeMaterial: z.string(),
    entryAngle: z.number().optional(),
    exitAngle: z.number().optional(),
    bendRadius: z.number().optional(),
    safetyFactor: z.number().optional(),
});

const FluidPlanSchema = z.object({
    borePlanId: z.string(),
    soilType: z.string(),
    pumpRate: z.number().optional(),
    fluidType: z.string().optional(),
    additives: z.string().optional(),
    volumePerFt: z.number().optional(),
    totalVolume: z.number().optional(),
    cleaningRate: z.number().optional(),
});

async function getProjectSoilLayers(boreId: string): Promise<SoilLayerInput[]> {
    const bore = await prisma.bore.findUnique({
        where: { id: boreId },
        include: {
            project: {
                include: {
                    geotechReports: {
                        include: { soilLayers: true }
                    }
                }
            }
        }
    });

    if (!bore || !bore.project.geotechReports.length) return [];

    // Flatten layers from all reports (or just take the first report)
    // Assuming first report is relevant
    return bore.project.geotechReports[0].soilLayers.map(l => ({
        startDepth: l.startDepth,
        endDepth: l.endDepth,
        soilType: l.soilType,
        hardness: l.hardness,
        rockStrengthPsi: l.rockStrengthPsi
    }));
}

export async function upsertBorePlan(data: z.infer<typeof BorePlanSchema>) {
    try {
        const validated = BorePlanSchema.parse(data);

        // Fetch Soil Layers
        const soilLayers = await getProjectSoilLayers(validated.boreId);

        // Calculate theoretical pullback force (Simplified ASTM F1962)
        const estimatedPullback = calculatePullbackForce(
            validated.totalLength,
            validated.pipeDiameter,
            validated.pipeMaterial as any,
            soilLayers.length > 0 ? soilLayers : 'Clay',
            validated.safetyFactor || 1.5
        );

        const plan = await prisma.borePlan.upsert({
            where: { boreId: validated.boreId },
            update: {
                ...validated,
                pullbackForce: estimatedPullback,
            },
            create: {
                ...validated,
                pullbackForce: estimatedPullback,
            },
        });

        // Get project ID for revalidation
        const bore = await prisma.bore.findUnique({
            where: { id: validated.boreId },
            select: { projectId: true },
        });
        if (bore) revalidatePath(`/dashboard/projects/${bore.projectId}`);

        return { success: true, data: plan };
    } catch (error) {
        console.error('Failed to upsert bore plan:', error);
        return { success: false, error: 'Failed to save bore plan' };
    }
}

export async function upsertFluidPlan(data: z.infer<typeof FluidPlanSchema>) {
    try {
        const validated = FluidPlanSchema.parse(data);

        // --- FRAC-OUT ANALYSIS ---
        // 1. Get Bore Geometry (Need depth and length)
        // We need to fetch the borePlan to get totalLength and pipeDiameter
        const borePlan = await prisma.borePlan.findUnique({
            where: { id: validated.borePlanId },
            include: { bore: true }
        });

        let fracOutRisk = 'Low';

        if (borePlan) {
            // Fetch Soil Layers
            const soilLayers = await getProjectSoilLayers(borePlan.boreId);

            // Assumptions for calculation (since we don't have full profile passed in yet)
            // Assume max depth is approx 15% of length
            const estimatedDepth = borePlan.totalLength * 0.15;

            const fluidProps = {
                density: 9.0, // ppg
                viscosity: 15, // cP
                yieldPoint: 20 // lb/100ft2
            };

            const geo = {
                holeDiameterIn: borePlan.pipeDiameter * 1.5,
                pipeDiameterIn: borePlan.pipeDiameter,
                lengthFt: borePlan.totalLength,
                depthFt: estimatedDepth
            };

            // If no layers found, fallback to manual soilType
            let layersToUse = soilLayers;
            if (layersToUse.length === 0) {
                layersToUse = [{
                    startDepth: 0,
                    endDepth: 1000,
                    soilType: validated.soilType
                }];
            }

            const analysis = analyzeFracOutRisk(
                fluidProps,
                geo,
                layersToUse,
                validated.pumpRate || 50
            );

            fracOutRisk = analysis.riskLevel;
        }

        const plan = await prisma.fluidPlan.upsert({
            where: { borePlanId: validated.borePlanId },
            update: validated,
            create: validated,
        });

        // Update parent BorePlan with risk
        await prisma.borePlan.update({
            where: { id: validated.borePlanId },
            data: { fracOutRisk }
        });

        return { success: true, data: plan };
    } catch (error) {
        console.error('Failed to upsert fluid plan:', error);
        return { success: false, error: 'Failed to save fluid plan' };
    }
}

export async function getBoreEngineering(boreId: string) {
    try {
        const plan = await prisma.borePlan.findUnique({
            where: { boreId },
            include: { fluidPlan: true },
        });
        return { success: true, data: plan };
    } catch (error) {
        return { success: false, error: 'Failed to fetch engineering data' };
    }
}
