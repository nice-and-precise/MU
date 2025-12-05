import { prisma } from '@/lib/prisma';

export const CloseoutService = {
    getProjectSummary: async (projectId: string) => {
        const [
            project,
            bores,
            punchItems,
            safetyMeetings,
            jsas,
            invoices,
            changeOrders
        ] = await Promise.all([
            prisma.project.findUnique({ where: { id: projectId } }),
            prisma.bore.findMany({ where: { projectId } }),
            prisma.punchItem.findMany({ where: { projectId } }),
            prisma.safetyMeeting.count({ where: { projectId } }),
            prisma.jSA.count({ where: { projectId } }),
            prisma.invoice.findMany({ where: { projectId } }),
            prisma.changeOrder.findMany({ where: { projectId } })
        ]);

        if (!project) return null;

        // Financials
        const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.currentDue, 0);
        const approvedCOs = changeOrders
            .filter(co => co.status === 'APPROVED')
            .reduce((sum, co) => sum + (co.budgetImpact || 0), 0);
        const currentBudget = (project.budget || 0) + approvedCOs;

        // Production
        const totalFootage = bores.reduce((sum, bore) => sum + (bore.totalLength || 0), 0);
        const activeBores = bores.filter(b => b.status === 'DRILLING').length;

        // QC
        const openPunchItems = punchItems.filter(pi => pi.status === 'OPEN').length;

        return {
            financials: {
                budget: currentBudget,
                invoiced: totalInvoiced,
                percentBilled: currentBudget > 0 ? (totalInvoiced / currentBudget) * 100 : 0
            },
            production: {
                totalFootage,
                activeBores,
                totalBores: bores.length
            },
            safety: {
                meetings: safetyMeetings,
                jsas: jsas
            },
            qc: {
                openPunchItems,
                totalPunchItems: punchItems.length
            },
            status: project.status
        };
    },

    archiveProject: async (projectId: string) => {
        const openPunchItems = await prisma.punchItem.count({
            where: { projectId, status: 'OPEN' }
        });

        if (openPunchItems > 0) {
            throw new Error(`Cannot archive: ${openPunchItems} open punch items remaining.`);
        }

        await prisma.project.update({
            where: { id: projectId },
            data: { status: 'ARCHIVED' }
        });
    }
};
