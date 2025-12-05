'use server';

import { getIticClient, IticTicketRequest } from "@/lib/iticnxt/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { authenticatedAction } from "@/lib/safe-action";
import { SubmitTicketToIticSchema, SubmitMeetDocumentationSchema } from "@/schemas/compliance";

export const submitTicketToItic = authenticatedAction(
    SubmitTicketToIticSchema,
    async ({ ticketId, projectId }) => {
        // 1. Fetch the ticket data from our DB
        const ticket = await prisma.gsocTicket.findUnique({
            where: { id: ticketId },
            include: {
                whiteLining: true,
                project: true
            }
        });

        if (!ticket) {
            throw new Error('Ticket not found');
        }

        // 2. Prepare payload
        const payload: IticTicketRequest = {
            excavatorId: 'EXC-12345', // In real app, fetch from Company Settings
            workStartDate: ticket.startTimeFromGsoc,
            ticketType: ticket.ticketType as any, // Cast to expected enum
            description: ticket.whiteLining?.fieldDescription || 'No description',
            geometry: ticket.whiteLining?.locationGeometry || '',
            // Mapping location from project for now, ideally this comes from ticket details
            streetAddress: ticket.project.location || 'Unknown Address',
            city: 'Unknown', // Need to parse or store this
            county: 'Unknown', // Need to store this
        };

        // 3. Submit to ITICnxt
        const client = getIticClient();
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
            return { ticketNumber: response.ticketNumber };
        } else {
            throw new Error(response.errors?.join(', ') || 'Submission failed');
        }
    }
);

export const submitMeetDocumentation = authenticatedAction(
    SubmitMeetDocumentationSchema,
    async ({ meetTicketId, projectId }) => {
        const meet = await prisma.meetTicket.findUnique({
            where: { id: meetTicketId },
            include: {
                gsocTicket: true,
                attendees: true
            }
        });

        if (!meet) {
            throw new Error('Meet ticket not found');
        }

        const client = getIticClient();

        await client.submitMeetReport({
            ticketNumber: meet.gsocTicket.ticketNumber,
            meetDate: meet.meetScheduledFor || new Date(),
            attendees: meet.attendees.map(a => `${a.name} (${a.company || 'Unknown'})`),
            summary: meet.agreementNotes || 'No notes provided'
        });

        await prisma.complianceEvent.create({
            data: {
                projectId,
                ticketId: meet.ticketId,
                eventType: 'MEET_DOCS_SUBMITTED',
                details: `Submitted to ITICnxt with ${meet.attendees.length} attendees.`
            }
        });

        revalidatePath(`/dashboard/projects/${projectId}/216d`);
        return { success: true };
    }
);
