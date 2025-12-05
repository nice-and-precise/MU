'use server';

import { ReportingService } from '@/services/reporting';
import { GenerateAsBuiltSchema } from '@/schemas/reporting';
import { authenticatedAction } from '@/lib/safe-action';

export const generateAsBuilt = authenticatedAction(
    GenerateAsBuiltSchema,
    async ({ boreId }) => {
        return await ReportingService.generateAsBuilt(boreId);
    }
);
