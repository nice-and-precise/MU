'use server';

import { revalidatePath } from 'next/cache';
import { authenticatedAction } from '@/lib/safe-action';
import { z } from 'zod';
import { PlanningService } from '@/services/planning';
import { SaveRodPlanSchema } from '@/schemas/planning';

export const saveRodPlan = authenticatedAction(
    SaveRodPlanSchema,
    async ({ projectId, rods, settings }) => {
        await PlanningService.saveRodPlan(projectId, rods, settings);
        revalidatePath(`/dashboard/projects/${projectId}/plan`);
        return { success: true };
    }
);

export const getRodPlan = authenticatedAction(
    z.string(), // projectId
    async (projectId) => {
        return await PlanningService.getRodPlan(projectId);
    }
);
