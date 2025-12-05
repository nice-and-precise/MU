'use server';

import { authenticatedAction } from '@/lib/safe-action';
import { CloseoutService } from '@/services/closeout';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export const getProjectSummary = authenticatedAction(
    z.string(),
    async (projectId) => {
        return await CloseoutService.getProjectSummary(projectId);
    }
);

export const archiveProject = authenticatedAction(
    z.string(), // projectId
    async (projectId) => {
        await CloseoutService.archiveProject(projectId);
        revalidatePath(`/dashboard/projects/${projectId}`);
        return { success: true };
    }
);
