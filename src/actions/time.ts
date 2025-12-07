'use server'

import { revalidatePath } from "next/cache"
import { authenticatedAction } from "@/lib/safe-action"
import { TimeService } from "@/services/time"
import { ClockInSchema, ClockOutSchema, GetClockStatusSchema } from "@/schemas/time"
import { z } from "zod"

export const clockIn = authenticatedAction(
    ClockInSchema,
    async (data, userId) => {
        const entry = await TimeService.clockIn(data, userId);
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/time');
        return entry;
    }
);

export const clockOut = authenticatedAction(
    ClockOutSchema,
    async (data, userId) => {
        const entry = await TimeService.clockOut(data, userId);
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/time');
        return entry;
    }
);

export const getClockStatus = authenticatedAction(
    GetClockStatusSchema,
    async (employeeId) => {
        return await TimeService.getClockStatus(employeeId);
    }
);

export const getWeeklyEstGrossPay = authenticatedAction(
    z.string(), // employeeId
    async (employeeId) => {
        return await TimeService.getWeeklyEstGrossPay(employeeId);
    }
);

