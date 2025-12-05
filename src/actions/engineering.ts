'use server';

import { revalidatePath } from 'next/cache';
import { authenticatedAction } from '@/lib/safe-action';
import { z } from 'zod';
import { EngineeringService } from '@/services/engineering';
import { BorePlanSchema, FluidPlanSchema } from '@/schemas/engineering';
import { prisma } from '@/lib/prisma';

export const upsertBorePlan = authenticatedAction(
    BorePlanSchema,
    async (data) => {
        const plan = await EngineeringService.upsertBorePlan(data);

        // Revalidate project dashboard
        // We need to fetch the bore to get the projectId for revalidation
        const bore = await prisma.bore.findUnique({ where: { id: data.boreId } });
        if (bore) {
            revalidatePath(`/dashboard/projects/${bore.projectId}`);
        }

        return plan;
    }
);

export const upsertFluidPlan = authenticatedAction(
    FluidPlanSchema,
    async (data) => {
        return await EngineeringService.upsertFluidPlan(data);
    }
);

export const getBoreEngineering = authenticatedAction(
    z.string(), // boreId
    async (boreId) => {
        return await EngineeringService.getBoreEngineering(boreId);
    }
);
