'use server';

import { EstimatingService } from '@/services/estimating';
import {
    CreateEstimateSchema,
    CreateEstimateFromItemsSchema,
    UpdateEstimateSchema,
    CreateEstimateItemSchema,
    UpdateLineItemSchema
} from '@/schemas/estimating';
import { authenticatedAction, authenticatedActionNoInput } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// 🎓 ACADEMY LESSON: The Fortress Pattern
// We are replacing the manual "check session -> check validation -> try/catch" pattern
// with a declarative `authenticatedAction` wrapper.
// This ensures every action is:
// 1. Authenticated (Gatekeeper)
// 2. Validated (Inspector)
// 3. Safe from crashes (Scribe)

// --- Estimate Actions ---

export const createEstimate = authenticatedAction(
    CreateEstimateSchema,
    async (data, userId) => {
        const estimate = await EstimatingService.createEstimate(userId, data);
        revalidatePath('/dashboard/estimating');
        return estimate;
    }
);

export const createEstimateFromItems = authenticatedAction(
    CreateEstimateFromItemsSchema,
    async (data, userId) => {
        const estimate = await EstimatingService.createEstimateFromItems(userId, data);
        revalidatePath('/dashboard/estimating');
        return estimate;
    }
);

// For getEstimate, we use a simple schema to validate the ID.
// Note: In Server Components, you often fetch directly, but if this is used as an Action, this is safe.
export const getEstimate = authenticatedAction(
    z.string(),
    async (id) => {
        return await EstimatingService.getEstimate(id);
    }
);

// 🎓 BRIDGE PATTERN:
// The original `updateEstimate` took (id, data). 
// Our `authenticatedAction` expects a single input object.
// To keep the API clean but backward compatible if needed, we define the action with a combined schema.
const updateEstimateAction = authenticatedAction(
    z.object({
        id: z.string(),
        data: UpdateEstimateSchema
    }),
    async ({ id, data }) => {
        const estimate = await EstimatingService.updateEstimate(id, data);
        revalidatePath(`/dashboard/estimating/${id}`);
        return estimate;
    }
);

// We export a wrapper to match the original signature if strict compatibility is needed,
// OR we can just export the new action. 
// For this lesson, let's expose the cleaner API and assume the client adapts, 
// but here is how we would bridge it:
export async function updateEstimate(id: string, data: any) {
    return updateEstimateAction({ id, data });
}

// --- Line Item Actions ---

export const addLineItem = authenticatedAction(
    z.object({
        estimateId: z.string(),
        data: CreateEstimateItemSchema
    }),
    async ({ estimateId, data }) => {
        await EstimatingService.addLineItem(estimateId, data);
        revalidatePath(`/dashboard/estimating/${estimateId}`);
        return { success: true };
    }
);

// Original signature: updateLineItem(id, data)
const updateLineItemAction = authenticatedAction(
    z.object({
        id: z.string(),
        data: UpdateLineItemSchema.omit({ id: true }) // Schema has ID, but we pass it separately in the wrapper
    }),
    async ({ id, data }) => {
        // We need to cast data to the partial input expected by service
        const line = await EstimatingService.updateLineItem(id, data);
        revalidatePath(`/dashboard/estimating/${line.estimateId}`);
        return { success: true };
    }
);

export async function updateLineItem(id: string, data: any) {
    return updateLineItemAction({ id, data });
}

export const deleteLineItem = authenticatedAction(
    z.string(),
    async (id) => {
        const line = await EstimatingService.deleteLineItem(id);
        revalidatePath(`/dashboard/estimating/${line.estimateId}`);
        return { success: true };
    }
);

export const duplicateEstimate = authenticatedAction(
    z.string(),
    async (id, userId) => {
        const newEstimate = await EstimatingService.duplicateEstimate(userId, id);
        revalidatePath('/dashboard/estimating');
        return newEstimate;
    }
);

export const convertEstimateToProject = authenticatedAction(
    z.string(),
    async (id, userId) => {
        const project = await EstimatingService.convertEstimateToProject(userId, id);
        revalidatePath('/dashboard/projects');
        return project;
    }
);

// --- Helper ---

export const getCostItems = authenticatedActionNoInput(
    async () => {
        return await EstimatingService.getCostItems();
    }
);
