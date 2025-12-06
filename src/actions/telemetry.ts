'use server';

import { authenticatedAction } from '@/lib/safe-action';
import { z } from 'zod';
import { TelemetryService } from '@/services/telemetry';

export const getLatestTelemetry = authenticatedAction(
    z.string(), // boreId
    async (boreId) => {
        return await TelemetryService.getLatestTelemetry(boreId);
    }
);

export const getTelemetryHistory = authenticatedAction(
    z.object({
        boreId: z.string(),
        limit: z.number().optional().default(100)
    }),
    async ({ boreId, limit }) => {
        return await TelemetryService.getTelemetryHistory(boreId, limit);
    }
);

export const simulateTelemetry = authenticatedAction(
    z.string(),
    async (boreId) => {
        return await TelemetryService.simulateTelemetry(boreId);
    }
);

export const saveImportedLogs = authenticatedAction(
    z.object({
        boreId: z.string(),
        logs: z.array(z.any())
    }),
    async ({ boreId, logs }) => {
        return await TelemetryService.saveImportedLogs(boreId, logs);
    }
);
