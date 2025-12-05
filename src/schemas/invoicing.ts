import { z } from 'zod';

export const InvoiceItemSchema = z.object({
    id: z.string(),
    thisPeriod: z.number().optional().default(0),
    stored: z.number().optional().default(0),
    scheduledValue: z.number(),
    previous: z.number().optional().default(0),
});

export const CreateInvoiceSchema = z.object({
    projectId: z.string(),
});

export const UpdateInvoiceSchema = z.object({
    id: z.string(),
    data: z.object({
        periodStart: z.coerce.date(),
        periodEnd: z.coerce.date(),
        items: z.array(InvoiceItemSchema),
    }),
});

export const FinalizeInvoiceSchema = z.object({
    id: z.string(),
});
