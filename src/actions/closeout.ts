'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getProjectSummary(projectId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return null;

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
}

export async function archiveProject(projectId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    // Validation checks
    const openPunchItems = await prisma.punchItem.count({
        where: { projectId, status: 'OPEN' }
    });

    if (openPunchItems > 0) {
        return { success: false, error: `Cannot archive: ${openPunchItems} open punch items remaining.` };
    }

    try {
        await prisma.project.update({
            where: { id: projectId },
            data: { status: 'ARCHIVED' }
        });
        revalidatePath(`/dashboard/projects/${projectId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to archive project:', error);
        return { success: false, error: 'Failed to archive project' };
    }
}
