'use server';

import { authenticatedAction } from '@/lib/safe-action';
import { ConflictService } from '@/services/conflicts';
import { ConflictCheckSchema } from '@/schemas/conflicts';

export const checkConflicts = authenticatedAction(
    ConflictCheckSchema,
    async (params) => {
        return await ConflictService.checkConflicts(params);
    }
);
