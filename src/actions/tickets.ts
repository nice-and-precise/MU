'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Ticket811, Ticket811Response } from '@prisma/client';

export type TicketData = Omit<Ticket811, 'id' | 'createdAt' | 'updatedAt' | 'project'>;

export async function createTicket(data: TicketData) {
    try {
        const ticket = await prisma.ticket811.create({
            data: {
                ...data,
                utilitiesNotified: data.utilitiesNotified || '[]',
            },
        });
        revalidatePath('/811');
        return { success: true, data: ticket };
    } catch (error) {
        console.error('Error creating ticket:', error);
        return { success: false, error: 'Failed to create ticket' };
    }
}

export async function getTickets(filter?: { status?: string; projectId?: string }) {
    try {
        const where: any = {};
        if (filter?.status) where.status = filter.status;
        if (filter?.projectId) where.projectId = filter.projectId;

        const tickets = await prisma.ticket811.findMany({
            where,
            orderBy: { submittedAt: 'desc' },
            include: {
                responses: true,
            },
        });
        return { success: true, data: tickets };
    } catch (error) {
        console.error('Error fetching tickets:', error);
        return { success: false, error: 'Failed to fetch tickets' };
    }
}

export async function updateTicket(id: string, data: Partial<TicketData>) {
    try {
        const ticket = await prisma.ticket811.update({
            where: { id },
            data,
        });
        revalidatePath('/811');
        revalidatePath(`/811/${id}`);
        return { success: true, data: ticket };
    } catch (error) {
        console.error('Error updating ticket:', error);
        return { success: false, error: 'Failed to update ticket' };
    }
}

export async function deleteTicket(id: string) {
    try {
        await prisma.ticket811.delete({
            where: { id },
        });
        revalidatePath('/811');
        return { success: true };
    } catch (error) {
        console.error('Error deleting ticket:', error);
        return { success: false, error: 'Failed to delete ticket' };
    }
}

export async function addTicketResponse(ticketId: string, data: { utilityName: string; status: string; notes?: string }) {
    try {
        const response = await prisma.ticket811Response.create({
            data: {
                ticketId,
                ...data,
            },
        });
        revalidatePath(`/811/${ticketId}`);
        return { success: true, data: response };
    } catch (error) {
        console.error('Error adding ticket response:', error);
        return { success: false, error: 'Failed to add ticket response' };
    }
}

// Utility to parse email body (Regex logic from PRD)
export async function parseTicketEmail(emailBody: string) {
    const patterns = {
        ticketNumber: /TICKET NUMBER:\s*(\d{8}-\d{6})/,
        ticketType: /TICKET TYPE:\s*(.+)/,
        submitted: /SUBMITTED:\s*(\d{2}\/\d{2}\/\d{4}\s+\d{1,2}:\d{2}\s+[AP]M)/,
        workToBegin: /WORK TO BEGIN:\s*(\d{2}\/\d{2}\/\d{4}\s+\d{1,2}:\d{2}\s+[AP]M)/,
        expires: /EXPIRES:\s*(\d{2}\/\d{2}\/\d{4}\s+\d{1,2}:\d{2}\s+[AP]M)/,
        company: /COMPANY:\s*(.+)/,
        caller: /CALLER:\s*(.+)/,
        phone: /PHONE:\s*(.+)/,
        // Work site regex might need adjustment based on actual format
        workSite: /WORK SITE:\n(.+)\n(.+),\s*MN\s*(\d{5})/,
        county: /County:\s*(.+)|(\w+)\s+County/,
        membersNotified: /MEMBERS NOTIFIED:\n([\s\S]+?)(?=\n\nView|$)/
    };

    const extract = (regex: RegExp) => {
        const match = emailBody.match(regex);
        return match ? match[1].trim() : null;
    };

    const parseDate = (dateStr: string | null) => {
        if (!dateStr) return new Date();
        return new Date(dateStr); // Basic parsing, might need more robust handling
    };

    const ticketNumber = extract(patterns.ticketNumber);
    if (!ticketNumber) return null;

    return {
        ticketNumber,
        type: extract(patterns.ticketType) || 'NORMAL',
        submittedAt: parseDate(extract(patterns.submitted)),
        workToBeginDate: parseDate(extract(patterns.workToBegin)),
        expirationDate: parseDate(extract(patterns.expires)),
        company: extract(patterns.company) || '',
        caller: extract(patterns.caller) || '',
        phone: extract(patterns.phone) || '',
        workSiteAddress: extract(patterns.workSite) || '', // Needs better extraction logic
        county: extract(patterns.county) || '',
        utilitiesNotified: extract(patterns.membersNotified) || '[]',
    };
}
