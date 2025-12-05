import { prisma } from '@/lib/prisma';

export const InvoicingService = {
    createInvoice: async (projectId: string, userId: string) => {
        // 1. Get Project and Active Estimate
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                estimates: { where: { status: { in: ['WON', 'SENT'] } }, include: { lines: { include: { costItem: true } } } },
                changeOrders: { where: { status: 'APPROVED' } }
            }
        });

        if (!project) throw new Error('Project not found');

        const estimate = project.estimates[0];
        if (!estimate) throw new Error('No active estimate found');

        // 2. Get Previous Invoice (if any) to carry over "Previous" amounts
        const lastInvoice = await prisma.invoice.findFirst({
            where: { projectId },
            orderBy: { applicationNo: 'desc' },
            include: { items: true }
        });

        const nextAppNo = (lastInvoice?.applicationNo || 0) + 1;
        const previousItemsMap = new Map(lastInvoice?.items.map(i => [i.description, i]));

        // 3. Create New Invoice
        const invoice = await prisma.invoice.create({
            data: {
                projectId,
                applicationNo: nextAppNo,
                periodStart: lastInvoice ? lastInvoice.periodEnd : new Date(), // Default to end of last period
                periodEnd: new Date(),
                createdById: userId,
                status: 'DRAFT',
            }
        });

        // 4. Create Invoice Items from Estimate Lines
        const invoiceItems = [];

        // Add Estimate Lines
        for (const line of estimate.lines) {
            const prevItem = previousItemsMap.get(line.description);
            const previousAmount = prevItem ? prevItem.totalCompleted : 0;

            invoiceItems.push({
                invoiceId: invoice.id,
                description: line.description,
                scheduledValue: line.total,
                previous: previousAmount,
                thisPeriod: 0,
                stored: 0,
                totalCompleted: previousAmount,
                percentComplete: line.total > 0 ? (previousAmount / line.total) * 100 : 0,
                balance: line.total - previousAmount,
                retainage: previousAmount * 0.10, // Default 10% retainage on previous work
            });
        }

        // Add Approved Change Orders
        for (const co of project.changeOrders) {
            const description = `CO #${co.id.slice(-4)}: ${co.scope}`;
            const prevItem = previousItemsMap.get(description);
            const previousAmount = prevItem ? prevItem.totalCompleted : 0;
            const value = co.budgetImpact || 0;

            invoiceItems.push({
                invoiceId: invoice.id,
                description: description,
                scheduledValue: value,
                previous: previousAmount,
                thisPeriod: 0,
                stored: 0,
                totalCompleted: previousAmount,
                percentComplete: value > 0 ? (previousAmount / value) * 100 : 0,
                balance: value - previousAmount,
                retainage: previousAmount * 0.10,
            });
        }

        await prisma.invoiceItem.createMany({ data: invoiceItems });
        return invoice;
    },

    getInvoices: async (projectId: string) => {
        return await prisma.invoice.findMany({
            where: { projectId },
            orderBy: { applicationNo: 'desc' },
            include: { createdBy: { select: { name: true } } }
        });
    },

    getInvoice: async (id: string) => {
        return await prisma.invoice.findUnique({
            where: { id },
            include: { items: true, project: true }
        });
    },

    updateInvoice: async (id: string, data: { items: any[], periodStart: Date, periodEnd: Date }) => {
        // Update Invoice Header
        await prisma.invoice.update({
            where: { id },
            data: {
                periodStart: data.periodStart,
                periodEnd: data.periodEnd,
            }
        });

        // Update Items
        let totalCompleted = 0;
        let totalRetainage = 0;

        for (const item of data.items) {
            const completed = (item.previous || 0) + (item.thisPeriod || 0) + (item.stored || 0);
            const retainage = completed * 0.10; // 10% Retainage

            totalCompleted += completed;
            totalRetainage += retainage;

            await prisma.invoiceItem.update({
                where: { id: item.id },
                data: {
                    thisPeriod: item.thisPeriod,
                    stored: item.stored,
                    totalCompleted: completed,
                    percentComplete: item.scheduledValue > 0 ? (completed / item.scheduledValue) * 100 : 0,
                    balance: item.scheduledValue - completed,
                    retainage: retainage,
                }
            });
        }

        // Update Invoice Totals
        await prisma.invoice.update({
            where: { id },
            data: {
                totalCompleted,
                retainageAmount: totalRetainage,
                totalEarned: totalCompleted - totalRetainage,
                currentDue: (totalCompleted - totalRetainage) - 0,
            }
        });
    },

    finalizeInvoice: async (id: string) => {
        await prisma.invoice.update({
            where: { id },
            data: { status: 'SUBMITTED' }
        });
    }
};
