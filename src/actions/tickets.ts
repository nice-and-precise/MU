'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getTickets(projectId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return [];

    const tickets = await prisma.ticket811.findMany({
        where: { projectId },
        orderBy: { expirationDate: 'asc' }
    });

    return tickets.map(t => ({
        id: t.id,
        number: t.ticketNumber,
        project: projectId, // We might want project name here if needed, but UI usually has context
        expiration: t.expirationDate.toISOString(),
        status: t.status === 'ACTIVE' ? 'Active' : 'Expired'
    }));
}

export async function createTicket(data: {
    projectId: string;
    ticketNumber: string;
    ticketDate: Date;
    expirationDate: Date;
    notes?: string;
}) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const ticket = await prisma.ticket811.create({
            data: {
                projectId: data.projectId,
                ticketNumber: data.ticketNumber,
                ticketDate: data.ticketDate,
                expirationDate: data.expirationDate,
                notes: data.notes,
                status: 'ACTIVE'
            }
        });
        revalidatePath(`/dashboard/projects/${data.projectId}`);
        return { success: true, data: ticket };
    } catch (error) {
        console.error('Failed to create ticket:', error);
        return { success: false, error: 'Failed to create ticket' };
    }
}

export async function updateTicketStatus(id: string, status: string) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const ticket = await prisma.ticket811.update({
            where: { id },
            data: { status }
        });
        revalidatePath(`/dashboard/projects/${ticket.projectId}`);
        return { success: true, data: ticket };
    } catch (error) {
        console.error('Failed to update ticket:', error);
        return { success: false, error: 'Failed to update ticket' };
    }
}
