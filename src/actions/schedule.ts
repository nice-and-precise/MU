'use server'

import { revalidatePath } from "next/cache"
import { authenticatedAction, authenticatedActionNoInput } from "@/lib/safe-action"
import { ScheduleService } from "@/services/schedule"
import {
    GetShiftsSchema,
    CreateShiftSchema,
    UpdateShiftSchema,
    DeleteShiftSchema
} from "@/schemas/schedule"

// getShifts doesn't take input in the original, but here we likely want Date inputs?
// Original: export async function getShifts(start: Date, end: Date)
// So we need a schema for it.
export const getShifts = authenticatedAction(
    GetShiftsSchema,
    async ({ start, end }) => {
        return await ScheduleService.getShifts(start, end)
    }
);

export const createShift = authenticatedAction(
    CreateShiftSchema,
    async (data) => {
        const result = await ScheduleService.createShift(data)
        if (result.shift) {
            revalidatePath('/dashboard/dispatch')
        }
        return result
    }
);

export const updateShift = authenticatedAction(
    UpdateShiftSchema,
    async ({ id, ...data }) => {
        const shift = await ScheduleService.updateShift(id, data)
        revalidatePath('/dashboard/dispatch')
        return shift
    }
);

export const deleteShift = authenticatedAction(
    DeleteShiftSchema,
    async ({ id }) => {
        await ScheduleService.deleteShift(id)
        revalidatePath('/dashboard/dispatch')
        return { success: true }
    }
);

