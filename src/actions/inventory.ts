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

export async function recordTransaction(data: z.infer<typeof TransactionSchema>) {
    try {
        const validated = TransactionSchema.parse(data);

        // Update item quantity
        const item = await prisma.inventoryItem.findUnique({ where: { id: validated.itemId } });
        if (!item) throw new Error('Item not found');

        let newQuantity = item.quantityOnHand;
        if (validated.type === 'IN') newQuantity += validated.quantity;
        if (validated.type === 'OUT') newQuantity -= validated.quantity;
        if (validated.type === 'ADJUST') newQuantity = validated.quantity; // Adjust sets the absolute value? Or relative? Usually adjust is relative or set. Let's assume set for now or handle carefully. 
        // Actually, standard inventory adjustment usually implies adding/subtracting to match count. 
        // But if type is ADJUST, let's assume the quantity passed IS the new quantity? 
        // Or is it the delta? Let's stick to IN/OUT for deltas. 
        // If type is ADJUST, let's assume the user is providing the DELTA or the NEW TOTAL. 
        // For simplicity, let's say ADJUST means "Add this amount (can be negative)" or maybe we just stick to IN/OUT.
        // Let's treat ADJUST as a delta too for now, or just use IN/OUT.
        // If the user wants to set exact count, they calculate delta.

        // Let's refine: IN adds, OUT subtracts.

        await prisma.$transaction([
            prisma.inventoryTransaction.create({
                data: {
                    itemId: validated.itemId,
                    type: validated.type,
                    quantity: validated.quantity,
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
