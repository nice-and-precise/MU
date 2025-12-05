import { z } from 'zod';

export const CreateEstimateSchema = z.object({
    name: z.string().min(1, "Name is required"),
    customerName: z.string().optional(),
    projectId: z.string().optional(),
});

export const CreateEstimateItemSchema = z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.number().min(0),
    unit: z.string().min(1, "Unit is required"),
    unitCost: z.number().min(0),
    markup: z.number().optional().default(0),
    laborCost: z.number().optional().default(0),
    equipmentCost: z.number().optional().default(0),
    materialCost: z.number().optional().default(0),
});

export const CreateEstimateFromItemsSchema = z.object({
    name: z.string().min(1, "Name is required"),
    items: z.array(CreateEstimateItemSchema),
});

export const UpdateEstimateSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    customerName: z.string().optional(),
    customerEmail: z.string().email().optional().or(z.literal('')),
    customerPhone: z.string().optional(),
    status: z.enum(['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'ARCHIVED']).optional(),
    subtotal: z.number().optional(),
    total: z.number().optional(),
    markupPercent: z.number().optional(),
    markupAmount: z.number().optional(),
    taxPercent: z.number().optional(),
    taxAmount: z.number().optional(),
    notes: z.string().optional(),
    terms: z.string().optional(),
});

export const UpdateLineItemSchema = CreateEstimateItemSchema.partial().extend({
    id: z.string(),
});
