'use server';

import { revalidatePath } from 'next/cache';
import { authenticatedAction } from '@/lib/safe-action';
import { z } from 'zod';
import { ObstacleService } from '@/services/obstacles';
import { CreateObstacleSchema } from '@/schemas/obstacles';

export const getProjectObstacles = authenticatedAction(
    z.string(), // projectId
    async (projectId) => {
        return await ObstacleService.getProjectObstacles(projectId);
    }
);

export const createObstacle = authenticatedAction(
    CreateObstacleSchema,
    async (data) => {
        const obstacle = await ObstacleService.createObstacle(data);
        revalidatePath(`/dashboard/projects/${data.projectId}`);
        return obstacle;
    }
);

export const deleteObstacle = authenticatedAction(
    z.string(), // obstacleId
    async (id) => {
        await ObstacleService.deleteObstacle(id);
        // Note: Revalidating purely based on ID is hard without knowing project ID.
        // Ideally we'd pass projectId, but for now we'll just rely on client update or generic revalidate if needed.
        // Or we could fetch the obstacle first to get the projectId.
        // authenticatedAction doesn't easily allow "get before delete" unless in service.
        return { success: true };
    }
);
