'use server';

import { TelemetryService } from "@/services/telemetry";
import { authenticatedAction } from "@/lib/safe-action";
import { z } from "zod";

const GetTelemetrySchema = z.object({
    boreId: z.string()
});

export const getLatestBoreTelemetry = authenticatedAction(
    GetTelemetrySchema,
    async ({ boreId }) => {
        const log = await TelemetryService.getLatestTelemetry(boreId);
        return log;
    }
);
