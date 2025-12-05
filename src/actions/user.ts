'use server';

import { authenticatedAction, authenticatedActionNoInput } from '@/lib/safe-action';
import { UserService } from '@/services/user';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export const getUserPreferences = authenticatedActionNoInput(
    async (userId) => {
        return await UserService.getUserPreferences(userId);
    }
);

export const updateUserPreferences = authenticatedAction(
    z.object({
        notifications: z.boolean().optional(),
        // Add other preferences here as needed
    }),
    async (preferences, userId) => {
        // Fetch existing to merge
        const existing = await UserService.getUserPreferences(userId);
        const merged = { ...existing, ...preferences };

        await UserService.updateUserPreferences(userId, merged);
        revalidatePath('/dashboard/settings');
        return merged;
    }
);
