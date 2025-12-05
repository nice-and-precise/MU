import { prisma } from '@/lib/prisma';

export const ChangeManagementService = {
    // --- T&M Tickets ---
    async createTMTicket(data: { projectId: string; rfiId?: string; lineItems: any[]; photos?: string[]; userId: string }) {
        return await prisma.tMTicket.create({
            data: {
                projectId: data.projectId,
                rfiId: data.rfiId,
                lineItems: JSON.stringify(data.lineItems),
                photos: JSON.stringify(data.photos || []),
                createdById: data.userId,
                status: 'DRAFT',
            },
        });
    },

    async getTMTickets(projectId: string) {
        return await prisma.tMTicket.findMany({
            where: { projectId },
            include: {
                createdBy: { select: { name: true } },
                rfi: { select: { question: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    },

    // --- Change Orders ---
    async createChangeOrder(data: {
        projectId: string;
        tmTicketId?: string;
        rfiId?: string;
        scope: string;
        pricing: string;
        budgetImpact: number;
        userId: string;
    }) {
        return await prisma.changeOrder.create({
            data: {
                projectId: data.projectId,
                tmTicketId: data.tmTicketId,
                rfiId: data.rfiId,
                scope: data.scope,
                pricing: data.pricing,
                budgetImpact: data.budgetImpact,
                createdById: data.userId,
                status: 'PENDING',
            },
        });
    },

    async getChangeOrders(projectId: string) {
        return await prisma.changeOrder.findMany({
            where: { projectId },
            include: {
                createdBy: { select: { name: true } },
                tmTicket: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    },

    async approveChangeOrder(id: string, userId: string) {
        // Transaction: Update CO status AND Update Project Budget
        await prisma.$transaction(async (tx) => {
            const co = await tx.changeOrder.findUnique({ where: { id } });
            if (!co) throw new Error('Change Order not found');

            // 1. Update CO
            await tx.changeOrder.update({
                where: { id },
                data: {
                    status: 'APPROVED',
                    approvedById: userId,
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
    },
};
