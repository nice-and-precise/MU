'use server';

import { revalidatePath } from "next/cache";
import { InventoryService } from "@/services/inventory";
import {
    CreateInventoryItemSchema,
    UpdateInventoryItemSchema,
    RecordTransactionSchema,
    UpdateInventorySchema
} from "@/schemas/inventory";
import { authenticatedAction, authenticatedActionNoInput } from "@/lib/safe-action";
import { z } from "zod";

// 🛡️ Fortress Pattern Applied

export const getInventory = authenticatedActionNoInput(
    async () => {
        return await InventoryService.getInventoryItems();
    }
);

// Alias for getInventory to match import in page.tsx
export const getInventoryItems = getInventory;

export const createInventoryItem = authenticatedAction(
    CreateInventoryItemSchema,
    async (data) => {
        const item = await InventoryService.createInventoryItem(data);
        revalidatePath('/dashboard/inventory');
        return item;
    }
);

export const updateInventoryItem = authenticatedAction(
    z.object({
        id: z.string(),
        data: UpdateInventoryItemSchema
    }),
    async ({ id, data }) => {
        const item = await InventoryService.updateInventoryItem(id, data);
        revalidatePath('/dashboard/inventory');
        return item;
    }
);

export const deleteInventoryItem = authenticatedAction(
    z.string(),
    async (id) => {
        await InventoryService.deleteInventoryItem(id);
        revalidatePath('/dashboard/inventory');
        return { success: true };
    }
);

export const recordTransaction = authenticatedAction(
    RecordTransactionSchema.omit({ userId: true }),
    async (data, userId) => {
        // Inject userId from session
        const result = await InventoryService.recordTransaction({ ...data, userId });
        revalidatePath('/dashboard/inventory');
        return { newQuantity: result[0].quantityOnHand };
    }
);

export const updateInventory = authenticatedAction(
    UpdateInventorySchema.omit({ userId: true }),
    async (data, userId) => {
        // Inject userId from session
        const result = await InventoryService.updateInventory({ ...data, userId });
        revalidatePath('/dashboard');
        return { newQuantity: result[0].quantityOnHand };
    }
);

export const getLowStockItems = authenticatedAction(
    z.string().optional(),
    async (projectId) => {
        return await InventoryService.getLowStockItems();
    }
);

export const getInventoryTransactions = authenticatedAction(
    z.object({
        projectId: z.string(),
        date: z.date().optional()
    }),
    async ({ projectId, date }) => {
        return await InventoryService.getInventoryTransactions(projectId, date);
    }
);
