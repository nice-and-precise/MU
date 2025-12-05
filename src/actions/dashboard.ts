'use server';

import { authenticatedActionNoInput } from '@/lib/safe-action';
import { getActiveCrewsService, getDashboardStatsService, getRecentActivityService } from '@/services/dashboard';

export const getDashboardStats = authenticatedActionNoInput(async () => {
    return await getDashboardStatsService();
});

export const getRecentActivity = authenticatedActionNoInput(async () => {
    return await getRecentActivityService();
});

export const getActiveCrews = authenticatedActionNoInput(async () => {
    return await getActiveCrewsService();
});
