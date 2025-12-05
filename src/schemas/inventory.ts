import { z } from 'zod';

export const CreateInventoryItemSchema = z.object({
    name: z.string().min(1, "Name is required"),
    category: z.string().min(1, "Category is required"),
    unit: z.string().min(1, "Unit is required"),
    quantityOnHand: z.number().min(0, "Quantity cannot be negative"),
    sku: z.string().optional(),
    location: z.string().optional(),
    reorderPoint: z.number().optional(),
});

export const UpdateInventoryItemSchema = CreateInventoryItemSchema.partial();

export const TransactionTypeSchema = z.enum(['USE', 'RESTOCK', 'ADJUST', 'IN', 'OUT']);

export const RecordTransactionSchema = z.object({
    itemId: z.string().min(1, "Item ID is required"),
    type: TransactionTypeSchema,
    quantity: z.number().min(0, "Quantity must be positive"),
    projectId: z.string().optional(),
    userId: z.string().min(1, "User ID is required"),
    notes: z.string().optional(),
});

export const UpdateInventorySchema = z.object({
    itemId: z.string().min(1, "Item ID is required"),
    quantity: z.number().min(0),
    type: z.enum(['USE', 'RESTOCK']),
    projectId: z.string().min(1, "Project ID is required"),
    userId: z.string().min(1, "User ID is required"),
    notes: z.string().optional(),
});
