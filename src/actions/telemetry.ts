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
