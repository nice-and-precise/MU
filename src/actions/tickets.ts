'use server';

import { revalidatePath } from 'next/cache';
import { TicketsService } from '@/services/tickets';
import {
    CreateTicketSchema,
    UpdateTicketSchema,
    AddTicketResponseSchema,
    TicketFilterSchema
} from '@/schemas/tickets';
import { authenticatedAction } from '@/lib/safe-action';
import { z } from 'zod';
import { Ticket811 } from '@prisma/client';

export type TicketData = Omit<Ticket811, 'id' | 'createdAt' | 'updatedAt' | 'project'>;

export const createTicket = authenticatedAction(
    CreateTicketSchema,
    async (data) => {
        const ticket = await TicketsService.createTicket(data);
        revalidatePath('/811');
        return ticket;
    }
);

export const getTickets = authenticatedAction(
    TicketFilterSchema.optional(),
    async (filter) => {
        return await TicketsService.getTickets(filter);
    }
);

export const updateTicket = authenticatedAction(
    z.object({
        id: z.string(),
        data: UpdateTicketSchema
    }),
    async ({ id, data }) => {
        const ticket = await TicketsService.updateTicket(id, data);
        revalidatePath('/811');
        revalidatePath(`/811/${id}`);
        return ticket;
    }
);

export const deleteTicket = authenticatedAction(
    z.string(),
    async (id) => {
        await TicketsService.deleteTicket(id);
        revalidatePath('/811');
        return { success: true };
    }
);

export const addTicketResponse = authenticatedAction(
    z.object({
        ticketId: z.string(),
        data: AddTicketResponseSchema
    }),
    async ({ ticketId, data }) => {
        const response = await TicketsService.addTicketResponse(ticketId, data);
        revalidatePath(`/811/${ticketId}`);
        return response;
    }
);

// Utility to parse email body (Delegates to Service)
export const parseTicketEmail = authenticatedAction(
    z.string(),
    async (emailBody) => {
        return TicketsService.parseTicketEmail(emailBody);
    }
);
