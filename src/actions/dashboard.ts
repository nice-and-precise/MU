'use server';

import { authenticatedActionNoInput } from '@/lib/safe-action';
import {
    getActiveCrewsService,
    getDashboardStatsService,
    getRecentActivityService,
    getOwnerStatsService,
    getSuperStatsService,
    getCrewStatsService
} from '@/services/dashboard';

export const getDashboardStats = authenticatedActionNoInput(async () => {
    return await getDashboardStatsService();
});

export const getRecentActivity = authenticatedActionNoInput(async () => {
    return await getRecentActivityService();
});

export const getActiveCrews = authenticatedActionNoInput(async () => {
    return await getActiveCrewsService();
});

export const getOwnerStats = authenticatedActionNoInput(async () => {
    return await getOwnerStatsService();
});

export const getSuperStats = authenticatedActionNoInput(async () => {
    return await getSuperStatsService();
});

export const getCrewStats = authenticatedActionNoInput(async () => {
    return await getCrewStatsService();
});
