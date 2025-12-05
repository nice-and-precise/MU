'use server';

import { revalidatePath } from 'next/cache';
import { EngineeringService } from '@/services/engineering';
import { BorePlanSchema, FluidPlanSchema } from '@/schemas/engineering';
import { prisma } from '@/lib/prisma'; // Needed for revalidation logic (fetching projectId)

export async function upsertBorePlan(data: any) {
    const validation = BorePlanSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    try {
        const plan = await EngineeringService.upsertBorePlan(validation.data);

        // Revalidate project dashboard
        // We need to fetch the bore to get the projectId for revalidation
        const bore = await prisma.bore.findUnique({ where: { id: validation.data.boreId } });
        if (bore) {
            revalidatePath(`/dashboard/projects/${bore.projectId}`);
        }

        return { success: true, data: plan };
    } catch (error: any) {
        console.error('Failed to upsert bore plan:', error);
        return { success: false, error: error.message || 'Failed to save bore plan' };
    }
}

export async function upsertFluidPlan(data: any) {
    const validation = FluidPlanSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    try {
        const plan = await EngineeringService.upsertFluidPlan(validation.data);
        return { success: true, data: plan };
    } catch (error: any) {
        console.error('Failed to upsert fluid plan:', error);
        return { success: false, error: error.message || 'Failed to save fluid plan' };
    }
}

export async function getBoreEngineering(boreId: string) {
    try {
        const plan = await EngineeringService.getBoreEngineering(boreId);
        return { success: true, data: plan };
    } catch (error) {
        return { success: false, error: 'Failed to fetch engineering data' };
    }
}
