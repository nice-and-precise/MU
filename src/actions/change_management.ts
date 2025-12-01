'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// --- T&M Tickets ---

export async function createTMTicket(data: { projectId: string; rfiId?: string; lineItems: any[]; photos?: string[] }) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const ticket = await prisma.tMTicket.create({
            data: {
                projectId: data.projectId,
                rfiId: data.rfiId,
                lineItems: JSON.stringify(data.lineItems),
                photos: JSON.stringify(data.photos || []),
                createdById: session.user.id,
                status: 'DRAFT',
            },
        });
        revalidatePath(`/dashboard/projects/${data.projectId}`);
        return { success: true, data: ticket };
    } catch (error) {
        console.error('Failed to create T&M Ticket:', error);
        return { success: false, error: 'Failed to create T&M Ticket' };
    }
}

export async function getTMTickets(projectId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return [];

    return await prisma.tMTicket.findMany({
        where: { projectId },
        include: {
            createdBy: { select: { name: true } },
            rfi: { select: { question: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
}

// --- Change Orders ---

export async function createChangeOrder(data: { projectId: string; tmTicketId?: string; rfiId?: string; scope: string; pricing: string; budgetImpact: number }) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const co = await prisma.changeOrder.create({
            data: {
                projectId: data.projectId,
                tmTicketId: data.tmTicketId,
                rfiId: data.rfiId,
                scope: data.scope,
                pricing: data.pricing,
                budgetImpact: data.budgetImpact,
                createdById: session.user.id,
                status: 'PENDING',
            },
        });
        revalidatePath(`/dashboard/projects/${data.projectId}`);
        return { success: true, data: co };
    } catch (error) {
        console.error('Failed to create Change Order:', error);
        return { success: false, error: 'Failed to create Change Order' };
    }
}

export async function getChangeOrders(projectId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return [];

    return await prisma.changeOrder.findMany({
        where: { projectId },
        include: {
            createdBy: { select: { name: true } },
            tmTicket: true,
        },
        orderBy: { createdAt: 'desc' },
    });
}

export async function approveChangeOrder(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        // Transaction: Update CO status AND Update Project Budget
        await prisma.$transaction(async (tx) => {
            const co = await tx.changeOrder.findUnique({ where: { id } });
            if (!co) throw new Error('Change Order not found');

            // 1. Update CO
            await tx.changeOrder.update({
                where: { id },
                data: {
                    status: 'APPROVED',
                    approvedById: session.user.id,
                    approvedAt: new Date(),
                },
            });

            // 2. Update Project Budget
            if (co.budgetImpact) {
                await tx.project.update({
                    where: { id: co.projectId },
                    data: {
                        budget: { increment: co.budgetImpact },
                    },
                });
            }
        });

        revalidatePath(`/dashboard/projects`); // Revalidate broadly to update budget display
        return { success: true };
    } catch (error) {
        console.error('Failed to approve Change Order:', error);
        return { success: false, error: 'Failed to approve Change Order' };
    }
}
