"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authenticatedAction } from "@/lib/safe-action";
import { HDDService } from "@/services/hdd";
import { CreateRodPassManualSchema, CreatePotholeSchema } from "@/schemas/hdd";

// Note: This action is for manual entry. For automated calculation, see actions/drilling.ts
export const createRodPass = authenticatedAction(
    CreateRodPassManualSchema,
    async (data, userId) => {
        const rodPass = await HDDService.createRodPass({ ...data, loggedById: userId });
        revalidatePath(`/projects/${data.boreId}`);
        // Note: Check if /projects/[boreId] exists or if it should be /dashboard/projects/...
        // Original was `/projects/${data.boreId}`, but other actions use `/dashboard/projects/...`
        // I'll keep original for now to avoid breaking view references if they exist, 
        // but typically it's `/dashboard/projects/[projectId]/production/[boreId]`.
        // Given boreId is passed, we might not know projectId.
        return rodPass;
    }
);

export const getBoreLogs = authenticatedAction(
    z.string(), // boreId
    async (boreId) => {
        return await HDDService.getBoreLogs(boreId);
    }
);

export const createPothole = authenticatedAction(
    CreatePotholeSchema,
    async (data, userId) => {
        const pothole = await HDDService.createPothole({ ...data, createdById: userId });
        revalidatePath(`/dashboard/projects/${data.projectId}`); // Assuming standard dashboard path here
        return pothole;
    }
);
