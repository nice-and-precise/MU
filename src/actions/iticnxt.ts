'use server';

import { ITICnxtClient, ITICnxtTicketPayload } from "@/lib/iticnxt/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitTicketToItic(ticketId: string, projectId: string) {
    try {
        // 1. Fetch the ticket data from our DB
        const ticket = await prisma.gsocTicket.findUnique({
            where: { id: ticketId },
            include: { whiteLining: true }
        });

        if (!ticket) {
            return { success: false, message: 'Ticket not found' };
        }

        // 2. Prepare payload
        const payload: ITICnxtTicketPayload = {
            excavatorId: 'EXC-12345', // In real app, fetch from Company Settings
            workDate: ticket.startTimeFromGsoc,
            coordinates: ticket.whiteLining?.locationGeometry || '',
            ticketType: ticket.ticketType,
            description: ticket.whiteLining?.fieldDescription || ''
        };

        // 3. Submit to ITICnxt
        const client = new ITICnxtClient();
        const response = await client.submitTicket(payload);

        if (response.success && response.ticketNumber) {
            // 4. Update local ticket status
            await prisma.gsocTicket.update({
                where: { id: ticketId },
                data: {
                    status: 'SUBMITTED',
                    ticketNumber: response.ticketNumber, // Update with official number
                    filedAt: new Date()
                }
            });

            // Log compliance event
            await prisma.complianceEvent.create({
                data: {
                    projectId,
                    ticketId,
                    eventType: 'TICKET_SUBMITTED_API',
                    details: `Official Ticket #: ${response.ticketNumber}`
                }
            });

            revalidatePath(`/dashboard/projects/${projectId}/216d`);
            return { success: true, ticketNumber: response.ticketNumber };
        } else {
            return { success: false, message: response.message || 'Submission failed' };
        }

    } catch (error) {
        console.error('ITICnxt Submission Error:', error);
        return { success: false, message: 'Internal Server Error' };
    }
}
