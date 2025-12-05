'use server';

import { revalidatePath } from 'next/cache';
import { authenticatedAction } from '@/lib/safe-action';
import { z } from 'zod';
import { InspectionService } from '@/services/inspections';
import { SubmitInspectionSchema } from '@/schemas/inspections';

export const submitInspection = authenticatedAction(
    SubmitInspectionSchema,
    async (data, userId) => {
        const inspection = await InspectionService.submitInspection(data, userId);
        revalidatePath('/dashboard');
        return inspection;
    }
);

export const getAssetInspections = authenticatedAction(
    z.string(), // assetId
    async (assetId) => {
        return await InspectionService.getAssetInspections(assetId);
    }
);
