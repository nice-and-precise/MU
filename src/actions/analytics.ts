'use server';

import { authenticatedActionNoInput } from "@/lib/safe-action";
import { AnalyticsService } from "@/services/analytics";

export const getHistoricalProductionRates = authenticatedActionNoInput(async () => {
    return await AnalyticsService.getHistoricalProductionRates();
});
