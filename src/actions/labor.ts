'use server';

import { revalidatePath } from 'next/cache';
import { authenticatedAction } from '@/lib/safe-action';
import { z } from 'zod';
import { LaborService } from '@/services/labor';
import { CreateTimeCardSchema } from '@/schemas/labor';

// --- Employees & Crews ---
// Moved to src/actions/employees.ts and src/actions/crews.ts
// Keeping Time Cards here for now until Phase 2


// --- Time Cards ---

export const createTimeCard = authenticatedAction(
    CreateTimeCardSchema,
    async (data) => {
        const timeCard = await LaborService.createTimeCard(data);
        revalidatePath(`/dashboard/projects/${data.projectId}`);
        return timeCard;
    }
);

export const getTimeCards = authenticatedAction(
    z.string(), // projectId
    async (projectId) => {
        return await LaborService.getTimeCards(projectId);
    }
);
