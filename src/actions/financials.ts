"use server";

import { revalidatePath } from "next/cache";
import { FinancialsService } from "@/services/financials";
import { CreateTimeCardSchema } from "@/schemas/financials";
import { authenticatedAction } from "@/lib/safe-action";
import { z } from "zod";

export const createTimeCards = authenticatedAction(
    CreateTimeCardSchema, // Assuming this is compatible or needs adjustment
    async (data) => {
        const result = await FinancialsService.createTimeCards(data);
        revalidatePath(`/projects/${data.projectId}`);
        return { count: result.length };
    }
);

export const getProjectBurnRate = authenticatedAction(
    z.string(),
    async (projectId) => {
        return await FinancialsService.getProjectBurnRate(projectId);
    }
);

export const getProjectFinancials = authenticatedAction(
    z.string(),
    async (projectId) => {
        return await FinancialsService.getProjectFinancials(projectId);
    }
);

