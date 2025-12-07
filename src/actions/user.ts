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
        onboardingComplete: z.boolean().optional(),
        phone: z.string().optional(),
        theme: z.string().optional(),
    }),
    async (data, userId) => {
        // Separate actual table fields from JSON preferences
        const { phone, ...prefs } = data;

        // Fetch existing to merge preferences
        const existingUser = await UserService.getUserPreferences(userId); // returns user with preferences

        // Simpler approach: Pass everything to service and let it handle splitting.
        await UserService.updateUserPreferences(userId, { phone, preferences: prefs });
        revalidatePath('/dashboard/settings');
        return { success: true };
    }
);

export const toggleFavoriteAction = authenticatedAction(
    z.object({
        href: z.string(),
    }),
    async ({ href }, userId) => {
        const newFavorites = await UserService.toggleFavorite(userId, href);
        revalidatePath('/dashboard');
        return { favorites: newFavorites };
    }
);
