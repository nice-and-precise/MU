'use server';

import { revalidatePath } from 'next/cache';
import { authenticatedAction, authenticatedActionNoInput } from '@/lib/safe-action';
import { EquipmentService } from '@/services/equipment';
import {
    CreateAssetSchema,
    CreateMaintenanceLogSchema,
    GetMaintenanceLogsSchema,
    CreateUsageLogSchema
} from '@/schemas/equipment';

// --- Assets ---

export const createAsset = authenticatedAction(
    CreateAssetSchema,
    async (data) => {
        const asset = await EquipmentService.createAsset(data);
        revalidatePath('/dashboard/equipment');
        return asset;
    }
);

export const getAssets = authenticatedActionNoInput(async () => {
    return await EquipmentService.getAssets();
});

// --- Maintenance ---

export const createMaintenanceLog = authenticatedAction(
    CreateMaintenanceLogSchema,
    async (data) => {
        const log = await EquipmentService.createMaintenanceLog(data);
        revalidatePath('/dashboard/equipment');
        return log;
    }
);

export const getMaintenanceLogs = authenticatedAction(
    GetMaintenanceLogsSchema,
    async ({ assetId }) => {
        return await EquipmentService.getMaintenanceLogs(assetId);
    }
);

// --- Usage ---

export const createUsageLog = authenticatedAction(
    CreateUsageLogSchema,
    async (data) => {
        const log = await EquipmentService.createUsageLog(data);
        revalidatePath(`/dashboard/projects/${data.projectId}`);
        return log;
    }
);

