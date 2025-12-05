'use server'

import { revalidatePath } from "next/cache"
import { authenticatedAction, authenticatedActionNoInput } from "@/lib/safe-action"
import { CrewService } from "@/services/crews"
import {
    CreateCrewSchema,
    UpdateCrewSchema,
    DeleteCrewSchema,
    DispatchCrewSchema
} from "@/schemas/crews"

export const getCrews = authenticatedActionNoInput(async () => {
    return await CrewService.getCrews()
});

export const createCrew = authenticatedAction(
    CreateCrewSchema,
    async (data) => {
        const crew = await CrewService.createCrew(data)
        revalidatePath('/dashboard/labor')
        revalidatePath('/dashboard/crews')
        return crew
    }
);

export const updateCrew = authenticatedAction(
    UpdateCrewSchema,
    async ({ id, ...data }) => {
        const crew = await CrewService.updateCrew(id, data)
        revalidatePath('/dashboard/labor')
        revalidatePath('/dashboard/crews')
        return crew
    }
);

export const deleteCrew = authenticatedAction(
    DeleteCrewSchema,
    async ({ id }) => {
        await CrewService.deleteCrew(id)
        revalidatePath('/dashboard/labor')
        revalidatePath('/dashboard/crews')
        return { success: true }
    }
);

// Legacy dispatch function refactored
export const dispatchCrew = authenticatedAction(
    DispatchCrewSchema,
    async (data) => {
        const newCrew = await CrewService.dispatchCrew(data);
        revalidatePath('/dashboard');
        return newCrew;
    }
);

