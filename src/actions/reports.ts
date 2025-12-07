'use server';

import { authenticatedAction, authenticatedActionNoInput } from '@/lib/safe-action';
import { DailyReportService } from '@/services/daily-report';
import { CreateDailyReportSchema, UpdateDailyReportSchema } from '@/schemas/daily-report';
import { z } from 'zod';

export const getReports = authenticatedActionNoInput(
    async (userId) => {
        return await DailyReportService.getReports();
    }
);

export const getReport = authenticatedAction(
    z.string(),
    async (id) => {
        return await DailyReportService.getReport(id);
    }
);

export const createDailyReport = authenticatedAction(
    CreateDailyReportSchema,
    async (data, userId) => {
        return await DailyReportService.createDailyReport(userId, data);
    }
);

export const updateDailyReport = authenticatedAction(
    z.object({
        id: z.string(),
        data: UpdateDailyReportSchema
    }),
    async ({ id, data }) => {
        return await DailyReportService.updateDailyReport(id, data);
    }
);

export const approveDailyReport = authenticatedAction(
    z.string(),
    async (id, userId) => {
        return await DailyReportService.approveDailyReport(id, userId);
    }
);

export const getRecentProjectReport = authenticatedAction(
    z.string(),
    async (projectId) => {
        return await DailyReportService.getRecentProjectReport(projectId);
    }
);
