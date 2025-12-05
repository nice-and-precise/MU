'use server';

import { authenticatedAction, authenticatedActionNoInput } from '@/lib/safe-action';
import { AssetService } from '@/services/assets';
import { CreateAssetSchema, UpdateAssetSchema } from '@/schemas/assets';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export const getAssets = authenticatedActionNoInput(
  async () => {
    return await AssetService.getAssets();
  }
);

export const createAsset = authenticatedAction(
  CreateAssetSchema,
  async (data) => {
    const asset = await AssetService.createAsset(data);
    revalidatePath('/dashboard/assets');
    return asset;
  }
);

export const updateAsset = authenticatedAction(
  z.object({
    id: z.string(),
    data: UpdateAssetSchema
  }),
  async ({ id, data }) => {
    const asset = await AssetService.updateAsset(id, data);
    revalidatePath('/dashboard/assets');
    return asset;
  }
);

export const deleteAsset = authenticatedAction(
  z.string(),
  async (id) => {
    await AssetService.deleteAsset(id);
    revalidatePath('/dashboard/assets');
    return { success: true };
  }
);
