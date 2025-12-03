'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// --- Estimate Actions ---

export async function createEstimate(data: { name: string; customerName?: string; projectId?: string }) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        console.log("Creating estimate with data:", data);
        const estimate = await prisma.estimate.create({
            data: {
                name: data.name,
                customerName: data.customerName,
                projectId: data.projectId,
                createdById: session.user.id,
                status: 'DRAFT',
            },
        });
        revalidatePath('/dashboard/estimating');
        return { success: true, data: estimate };
    } catch (error) {
        console.error('Failed to create estimate:', error);
        return { success: false, error: 'Failed to create estimate' };
    }
}

export async function getEstimate(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    return await prisma.estimate.findUnique({
        where: { id },
        include: {
            lines: {
                orderBy: { lineNumber: 'asc' },
            },
            project: {
                select: { name: true },
            },
            createdBy: {
                select: { name: true },
            },
        },
    });
}

export async function updateEstimate(id: string, data: any) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const estimate = await prisma.estimate.update({
            where: { id },
            data,
        });
        revalidatePath(`/dashboard/estimating/${id}`);
        return { success: true, data: estimate };
    } catch (error) {
        return { success: false, error: 'Failed to update estimate' };
    }
}

// --- Line Item Actions ---

export async function addLineItem(estimateId: string, data: any) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        // Get current max line number
        const maxLine = await prisma.estimateLine.aggregate({
            where: { estimateId },
            _max: { lineNumber: true },
        });
        const nextLineNumber = (maxLine._max.lineNumber || 0) + 1;

        // Calculate totals
        const subtotal = data.quantity * data.unitCost;
        const total = subtotal * (1 + (data.markup || 0));

        await prisma.estimateLine.create({
            data: {
                estimateId,
                lineNumber: nextLineNumber,
                description: data.description,
                quantity: data.quantity,
                unit: data.unit,
                unitCost: data.unitCost,
                markup: data.markup || 0,
                subtotal,
                total,
                // Optional cost breakdowns
                laborCost: data.laborCost || 0,
                equipmentCost: data.equipmentCost || 0,
                materialCost: data.materialCost || 0,
            },
        });

        await recalculateEstimateTotals(estimateId);
        revalidatePath(`/dashboard/estimating/${estimateId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to add line item:', error);
        return { success: false, error: 'Failed to add line item' };
    }
}

export async function updateLineItem(id: string, data: any) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        // Calculate totals
        const subtotal = data.quantity * data.unitCost;
        const total = subtotal * (1 + (data.markup || 0));

        const line = await prisma.estimateLine.update({
            where: { id },
            data: {
                ...data,
                subtotal,
                total,
            },
        });

        await recalculateEstimateTotals(line.estimateId);
        revalidatePath(`/dashboard/estimating/${line.estimateId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to update line item' };
    }
}

export async function deleteLineItem(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const line = await prisma.estimateLine.delete({ where: { id } });
        await recalculateEstimateTotals(line.estimateId);
        revalidatePath(`/dashboard/estimating/${line.estimateId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete line item' };
    }
}

// --- Helper ---

async function recalculateEstimateTotals(estimateId: string) {
    const lines = await prisma.estimateLine.findMany({ where: { estimateId } });

    const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
    // We can support global markup/tax here if needed, for now just sum line totals
    // Or if Estimate has global markup, apply it to subtotal.
    // Let's assume Estimate.markupPercent applies to the whole subtotal if lines don't have individual markup,
    // but our model has markup on lines. Let's sum the line totals for now.

    const total = lines.reduce((sum, line) => sum + line.total, 0);
    const markupAmount = total - subtotal;

    await prisma.estimate.update({
        where: { id: estimateId },
        data: {
            subtotal,
            markupAmount,
            total, // TODO: Add tax calculation if needed
        },
    });
}
