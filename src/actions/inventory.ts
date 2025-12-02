'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getInventory(projectId?: string) {
    try {
        const inventory = await prisma.inventoryItem.findMany({
            // Assuming InventoryItem is linked to Project via some relation or we just fetch all for now
            // The schema shows InventoryItem has no direct projectId, but InventoryTransaction does.
            // However, typically inventory is global or site-specific.
            // Let's assume for now we fetch all items, or filter by location if added.
            orderBy: { name: 'asc' }
        });
        return { success: true, data: inventory };
    } catch (error) {
        console.error("Failed to fetch inventory:", error);
        return { success: false, error: "Failed to fetch inventory" };
    }
}

export async function updateInventory(data: {
    itemId: string;
    quantity: number;
    type: 'USE' | 'RESTOCK';
    projectId: string;
    userId: string;
    notes?: string;
}) {
    try {
        const item = await prisma.inventoryItem.findUnique({
            where: { id: data.itemId }
        });

        if (!item) {
            return { success: false, error: "Item not found" };
        }

        const newQuantity = data.type === 'RESTOCK'
            ? item.quantityOnHand + data.quantity
            : item.quantityOnHand - data.quantity;

        if (newQuantity < 0) {
            return { success: false, error: "Insufficient quantity" };
        }

        // Transaction: Update Item + Create Transaction Record
        await prisma.$transaction([
            prisma.inventoryItem.update({
                where: { id: data.itemId },
                data: { quantityOnHand: newQuantity }
            }),
            prisma.inventoryTransaction.create({
                data: {
                    itemId: data.itemId,
                    type: data.type,
                    quantity: data.type === 'USE' ? -data.quantity : data.quantity,
                    projectId: data.projectId,
                    userId: data.userId,
                    notes: data.notes
                }
            })
        ]);

        revalidatePath('/dashboard');
        return { success: true, newQuantity };
    } catch (error) {
        console.error("Failed to update inventory:", error);
        return { success: false, error: "Failed to update inventory" };
    }
}

// Alias for getInventory to match import in page.tsx
export const getInventoryItems = getInventory;

export async function createInventoryItem(data: {
    name: string;
    category: string;
    unit: string;
    quantityOnHand: number;
    sku?: string;
    location?: string;
    reorderPoint?: number;
}) {
    try {
        const item = await prisma.inventoryItem.create({
            data: {
                name: data.name,
                category: data.category,
                unit: data.unit,
                quantityOnHand: data.quantityOnHand,
                sku: data.sku,
                location: data.location,
                reorderPoint: data.reorderPoint
            }
        });
        revalidatePath('/dashboard/inventory');
        return { success: true, data: item };
    } catch (error) {
        console.error("Failed to create inventory item:", error);
        return { success: false, error: "Failed to create inventory item" };
    }
}

export async function updateInventoryItem(id: string, data: {
    name?: string;
    category?: string;
    unit?: string;
    sku?: string;
    location?: string;
    reorderPoint?: number;
}) {
    try {
        const item = await prisma.inventoryItem.update({
            where: { id },
            data
        });
        revalidatePath('/dashboard/inventory');
        return { success: true, data: item };
    } catch (error) {
        console.error("Failed to update inventory item:", error);
        return { success: false, error: "Failed to update inventory item" };
    }
}

export async function deleteInventoryItem(id: string) {
    try {
        await prisma.inventoryItem.delete({
            where: { id }
        });
        revalidatePath('/dashboard/inventory');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete inventory item:", error);
        return { success: false, error: "Failed to delete inventory item" };
    }
}

export async function recordTransaction(data: {
    itemId: string;
    type: 'IN' | 'OUT' | 'ADJUST';
    quantity: number;
    performedById: string;
    notes?: string;
    projectId?: string;
}) {
    try {
        const item = await prisma.inventoryItem.findUnique({ where: { id: data.itemId } });
        if (!item) return { success: false, error: "Item not found" };

        let newQuantity = item.quantityOnHand;
        if (data.type === 'IN') newQuantity += data.quantity;
        else if (data.type === 'OUT') newQuantity -= data.quantity;
        else if (data.type === 'ADJUST') newQuantity = data.quantity;

        await prisma.$transaction([
            prisma.inventoryItem.update({
                where: { id: data.itemId },
                data: { quantityOnHand: newQuantity }
            }),
            prisma.inventoryTransaction.create({
                data: {
                    itemId: data.itemId,
                    type: data.type === 'ADJUST' ? 'RESTOCK' : (data.type === 'IN' ? 'RESTOCK' : 'USE'), // Mapping ADJUST/IN to RESTOCK, OUT to USE for now as per schema enum
                    quantity: data.type === 'OUT' ? -data.quantity : data.quantity,
                    userId: data.performedById,
                    projectId: data.projectId,
                    notes: data.notes
                }
            })
        ]);

        revalidatePath('/dashboard/inventory');
        return { success: true, newQuantity };
    } catch (error) {
        console.error("Failed to record transaction:", error);
        return { success: false, error: "Failed to record transaction" };
    }
}

export async function getLowStockItems(projectId?: string) {
    try {
        const items = await prisma.inventoryItem.findMany({
            where: {
                quantityOnHand: {
                    lte: prisma.inventoryItem.fields.reorderPoint
                }
            }
        });
        return { success: true, data: items };
    } catch (error) {
        console.error("Failed to fetch low stock items:", error);
        return { success: false, error: "Failed to fetch low stock items" };
    }
}
export async function getInventoryTransactions(projectId: string, date?: Date) {
    try {
        const where: any = { projectId };
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            where.createdAt = {
                gte: startOfDay,
                lte: endOfDay
            };
        }

        const transactions = await prisma.inventoryTransaction.findMany({
            where,
            include: {
                item: true,
                user: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: transactions };
    } catch (error) {
        console.error("Failed to fetch inventory transactions:", error);
        return { success: false, error: "Failed to fetch inventory transactions" };
    }
}
