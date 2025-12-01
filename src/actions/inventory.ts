'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const InventoryItemSchema = z.object({
    name: z.string().min(1),
    sku: z.string().optional(),
    category: z.string(),
    description: z.string().optional(),
    unit: z.string(),
    quantityOnHand: z.number().min(0),
    reorderPoint: z.number().optional(),
    location: z.string().optional(),
    costPerUnit: z.number().optional(),
});

const TransactionSchema = z.object({
    itemId: z.string(),
    type: z.enum(['IN', 'OUT', 'ADJUST']),
    quantity: z.number().positive(),
    projectId: z.string().optional(),
    notes: z.string().optional(),
    performedById: z.string(),
});

export async function createInventoryItem(data: z.infer<typeof InventoryItemSchema>) {
    try {
        const validated = InventoryItemSchema.parse(data);
        const item = await prisma.inventoryItem.create({ data: validated });
        revalidatePath('/dashboard/inventory');
        return { success: true, data: item };
    } catch (error) {
        return { success: false, error: 'Failed to create item' };
    }
}

export async function getInventoryItems() {
    try {
        const items = await prisma.inventoryItem.findMany({
            orderBy: { name: 'asc' },
        });
        return { success: true, data: items };
    } catch (error) {
        return { success: false, error: 'Failed to fetch inventory' };
    }
}

export async function updateInventoryItem(id: string, data: Partial<z.infer<typeof InventoryItemSchema>>) {
    try {
        const validated = InventoryItemSchema.partial().parse(data);
        const item = await prisma.inventoryItem.update({
            where: { id },
            data: validated,
        });
        revalidatePath('/dashboard/inventory');
        return { success: true, data: item };
    } catch (error) {
        return { success: false, error: 'Failed to update item' };
    }
}

export async function deleteInventoryItem(id: string) {
    try {
        await prisma.inventoryItem.delete({ where: { id } });
        revalidatePath('/dashboard/inventory');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete item' };
    }
}

export async function recordTransaction(data: z.infer<typeof TransactionSchema>) {
    try {
        const validated = TransactionSchema.parse(data);

        // Get current item
        const item = await prisma.inventoryItem.findUnique({ where: { id: validated.itemId } });
        if (!item) throw new Error('Item not found');

        let newQuantity = item.quantityOnHand;
        let transactionQty = validated.quantity;

        if (validated.type === 'IN') {
            newQuantity += validated.quantity;
        } else if (validated.type === 'OUT') {
            newQuantity -= validated.quantity;
        } else if (validated.type === 'ADJUST') {
            // For ADJUST, input quantity is the NEW TOTAL
            // We record the delta in the transaction for history accuracy? 
            // Or just record the "Count" value.
            // Let's record the "Count" value (New Total) and let the UI handle display.
            newQuantity = validated.quantity;
        }

        await prisma.$transaction([
            prisma.inventoryTransaction.create({
                data: {
                    itemId: validated.itemId,
                    type: validated.type,
                    quantity: transactionQty, // For ADJUST, this is the New Total
                    projectId: validated.projectId,
                    notes: validated.notes,
                    userId: validated.performedById,
                },
            }),
            prisma.inventoryItem.update({
                where: { id: validated.itemId },
                data: { quantityOnHand: newQuantity },
            }),
        ]);

        revalidatePath('/dashboard/inventory');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to record transaction' };
    }
}
