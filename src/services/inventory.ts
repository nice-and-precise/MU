import { prisma } from '@/lib/prisma';
import { CreateInventoryItemSchema, UpdateInventoryItemSchema, RecordTransactionSchema, UpdateInventorySchema } from '@/schemas/inventory';
import { z } from 'zod';

export type CreateInventoryItemInput = z.infer<typeof CreateInventoryItemSchema>;
export type UpdateInventoryItemInput = z.infer<typeof UpdateInventoryItemSchema>;
export type RecordTransactionInput = z.infer<typeof RecordTransactionSchema>;
export type UpdateInventoryInput = z.infer<typeof UpdateInventorySchema>;

export class InventoryService {

    static async getInventoryItems() {
        return await prisma.inventoryItem.findMany({
            orderBy: { name: 'asc' }
        });
    }

    static async getInventoryItem(id: string) {
        return await prisma.inventoryItem.findUnique({
            where: { id }
        });
    }

    static async createInventoryItem(data: CreateInventoryItemInput) {
        return await prisma.inventoryItem.create({
            data
        });
    }

    static async updateInventoryItem(id: string, data: UpdateInventoryItemInput) {
        return await prisma.inventoryItem.update({
            where: { id },
            data
        });
    }

    static async deleteInventoryItem(id: string) {
        return await prisma.inventoryItem.delete({
            where: { id }
        });
    }

    static async updateInventory(data: UpdateInventoryInput) {
        const item = await prisma.inventoryItem.findUnique({
            where: { id: data.itemId }
        });

        if (!item) {
            throw new Error("Item not found");
        }

        const newQuantity = data.type === 'RESTOCK'
            ? item.quantityOnHand + data.quantity
            : item.quantityOnHand - data.quantity;

        if (newQuantity < 0) {
            throw new Error("Insufficient quantity");
        }

        // Transaction: Update Item + Create Transaction Record
        return await prisma.$transaction([
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
    }

    static async recordTransaction(data: RecordTransactionInput) {
        const item = await prisma.inventoryItem.findUnique({ where: { id: data.itemId } });
        if (!item) throw new Error("Item not found");

        let newQuantity = item.quantityOnHand;
        // Map types to logic
        // IN/RESTOCK -> Add
        // OUT/USE -> Subtract
        // ADJUST -> Set

        // Note: The schema enum for Transaction is USE, RESTOCK. 
        // The input allows IN, OUT, ADJUST. We need to map these to the DB enum if possible, 
        // OR the DB enum supports more. 
        // Looking at the original code: 
        // type: data.type === 'ADJUST' ? 'RESTOCK' : (data.type === 'IN' ? 'RESTOCK' : 'USE')
        // It seems the DB enum is restricted to USE/RESTOCK (or maybe more, but code implies mapping).

        if (data.type === 'IN' || data.type === 'RESTOCK') newQuantity += data.quantity;
        else if (data.type === 'OUT' || data.type === 'USE') newQuantity -= data.quantity;
        else if (data.type === 'ADJUST') newQuantity = data.quantity;

        if (newQuantity < 0) throw new Error("Insufficient quantity");

        const dbType = (data.type === 'ADJUST' || data.type === 'IN' || data.type === 'RESTOCK') ? 'RESTOCK' : 'USE';
        const dbQuantity = (data.type === 'OUT' || data.type === 'USE') ? -data.quantity : data.quantity;

        // Special case for ADJUST: quantity change is diff
        let transactionQuantity = dbQuantity;
        if (data.type === 'ADJUST') {
            transactionQuantity = newQuantity - item.quantityOnHand;
        }

        return await prisma.$transaction([
            prisma.inventoryItem.update({
                where: { id: data.itemId },
                data: { quantityOnHand: newQuantity }
            }),
            prisma.inventoryTransaction.create({
                data: {
                    itemId: data.itemId,
                    type: dbType,
                    quantity: transactionQuantity,
                    userId: data.userId,
                    projectId: data.projectId,
                    notes: data.notes
                }
            })
        ]);
    }

    static async getLowStockItems() {
        return await prisma.inventoryItem.findMany({
            where: {
                quantityOnHand: {
                    lte: prisma.inventoryItem.fields.reorderPoint
                }
            }
        });
    }

    static async getInventoryTransactions(projectId: string, date?: Date) {
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

        return await prisma.inventoryTransaction.findMany({
            where,
            include: {
                item: true,
                user: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}
