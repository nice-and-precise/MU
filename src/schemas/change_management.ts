import { z } from 'zod';

export const CreateTMTicketSchema = z.object({
    projectId: z.string(),
    rfiId: z.string().optional(),
    lineItems: z.array(z.any()), // JSON field in DB
    photos: z.array(z.string()).optional(), // JSON field in DB
});

export const CreateChangeOrderSchema = z.object({
    projectId: z.string(),
    tmTicketId: z.string().optional(),
    rfiId: z.string().optional(),
    scope: z.string(),
    pricing: z.string(), // e.g. "$5000 fixed"
    budgetImpact: z.number(),
});

export const ApproveChangeOrderSchema = z.object({
    id: z.string(),
});
