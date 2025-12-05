'use server';

import { authenticatedAction } from '@/lib/safe-action';
import { ProgressService } from '@/services/progress';
import { AddProgressSchema } from '@/schemas/progress';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export const getProjectProgress = authenticatedAction(
    z.string(),
    async (projectId) => {
        return await ProgressService.getProjectProgress(projectId);
    }
);

export const addProgress = authenticatedAction(
    AddProgressSchema,
    async (data) => {
        const progress = await ProgressService.addProgress(data);
        revalidatePath(`/dashboard/projects/${data.projectId}`);
        return progress;
    }
);
