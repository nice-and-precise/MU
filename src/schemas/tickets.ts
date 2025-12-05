import { z } from 'zod';

export const TicketStatusSchema = z.enum(['ACTIVE', 'EXPIRED', 'CLOSED', 'PENDING']);

export const CreateTicketSchema = z.object({
    ticketNumber: z.string().min(1, "Ticket number is required"),
    type: z.string().optional().nullable().default('NORMAL'),
    status: TicketStatusSchema.optional().nullable().default('ACTIVE'),
    submittedAt: z.date().optional().nullable(),
    workToBeginDate: z.date().optional().nullable(),
    expirationDate: z.date(),
    company: z.string().optional().nullable(),
    caller: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    workSiteAddress: z.string().optional().nullable(),
    county: z.string().optional().nullable(),
    utilitiesNotified: z.string().optional().nullable().default('[]'),
    projectId: z.string().optional().nullable(),
});

export const UpdateTicketSchema = CreateTicketSchema.partial();

export const AddTicketResponseSchema = z.object({
    utilityName: z.string().min(1, "Utility name is required"),
    status: z.string().min(1, "Status is required"),
    notes: z.string().optional(),
});

export const TicketFilterSchema = z.object({
    status: z.string().optional(),
    projectId: z.string().optional(),
}).optional();
