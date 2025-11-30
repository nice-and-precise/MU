
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getHistoricalProductionRates } from './analytics';

const EstimateSchema = z.object({
    projectId: z.string().optional(),
    name: z.string(),
    description: z.string().optional(),
    customerName: z.string().optional(),
    status: z.string().optional(),
});

const EstimateLineSchema = z.object({
    estimateId: z.string(),
    costItemId: z.string().optional(),
    description: z.string(),
    quantity: z.number(),
    unit: z.string(),
    unitCost: z.number(),
    markup: z.number().optional(),
});

export async function createEstimate(data: z.infer<typeof EstimateSchema>) {
    try {
        const validated = EstimateSchema.parse(data);
        // If projectId is provided, fetch customer info if missing
        let customerInfo = {};
        if (validated.projectId) {
            const project = await prisma.project.findUnique({
                where: { id: validated.projectId },
            });
            if (project) {
                customerInfo = {
                    customerName: project.customerName,
                    customerContact: project.customerContact,
                };
            }
        }

        // Get current user (Mock for now, assume first user or passed via context in real app)
        // In a real app, we'd get session.user.id
        const user = await prisma.user.findFirst();
        if (!user) throw new Error('No user found');

        const estimate = await prisma.estimate.create({
            data: {
                ...validated,
                ...customerInfo,
                createdById: user.id,
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

export async function addEstimateLine(data: z.infer<typeof EstimateLineSchema>) {
    try {
        const validated = EstimateLineSchema.parse(data);

        // Calculate totals
        const subtotal = validated.quantity * validated.unitCost;
        const markupAmount = subtotal * (validated.markup || 0);
        const total = subtotal + markupAmount;

        // Get max line number
        const lastLine = await prisma.estimateLine.findFirst({
            where: { estimateId: validated.estimateId },
            orderBy: { lineNumber: 'desc' },
        });
        const lineNumber = (lastLine?.lineNumber || 0) + 1;

        const line = await prisma.estimateLine.create({
            data: {
                ...validated,
                lineNumber,
                subtotal,
                total,
                markup: validated.markup || 0,
            },
        });

        // Recalculate Estimate Totals
        await updateEstimateTotals(validated.estimateId);

        revalidatePath(`/dashboard/estimating/${validated.estimateId}`);
        return { success: true, data: line };
    } catch (error) {
        return { success: false, error: 'Failed to add line' };
    }
}

async function updateEstimateTotals(estimateId: string) {
    const lines = await prisma.estimateLine.findMany({
        where: { estimateId },
    });

    const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
    const total = lines.reduce((sum, line) => sum + line.total, 0);
    const markupAmount = total - subtotal;

    await prisma.estimate.update({
        where: { id: estimateId },
        data: {
            subtotal,
            total,
            markupAmount,
        },
    });
}

/**
 * SMART ASSEMBLY: Generates estimate lines from a Bore Plan.
 * This bridges the Engineering -> Estimating gap.
 */
export async function generateEstimateFromBore(estimateId: string, boreId: string) {
    try {
        const bore = await prisma.bore.findUnique({
            where: { id: boreId },
            include: { borePlan: { include: { fluidPlan: true } } },
        });

        if (!bore || !bore.borePlan) {
            return { success: false, error: 'Bore plan not found' };
        }

        const plan = bore.borePlan;
        const length = plan.totalLength;
        const diameter = plan.pipeDiameter;
        const material = plan.pipeMaterial; // HDPE, Steel
        const soil = plan.fluidPlan?.soilType || 'Clay';

        // 1. Pipe Material
        // Find matching cost item or use generic
        let pipeItemCode = `MAT-${material}-${Math.round(diameter)}`; // e.g., MAT-HDPE-4
        // Fallback logic could go here

        const pipeItem = await prisma.costItem.findFirst({
            where: {
                OR: [
                    { code: pipeItemCode },
                    { name: { contains: `${diameter}" ${material}` } }
                ]
            }
        });

        if (pipeItem) {
            await addEstimateLine({
                estimateId,
                costItemId: pipeItem.id,
                description: `Product Pipe: ${pipeItem.name}`,
                quantity: length,
                unit: 'LF',
                unitCost: pipeItem.unitCost,
                markup: 0.15
            });
        } else {
            // Generic fallback
            await addEstimateLine({
                estimateId,
                description: `Product Pipe: ${diameter}" ${material} (Market Rate)`,
                quantity: length,
                unit: 'LF',
                unitCost: diameter * 2.5, // Rule of thumb
                markup: 0.15
            });
        }

        // 2. Drilling Labor & Equipment
        // Fetch historical rates
        const analyticsRes = await getHistoricalProductionRates();
        let ftPerHour = 40; // Default Clay

        if (analyticsRes.success && analyticsRes.data) {
            const rate = analyticsRes.data.find(r => r.soilType === soil);
            if (rate) ftPerHour = rate.avgFtPerHour;
        }

        // Adjust for rock if not found in history
        if (soil === 'Rock' && ftPerHour > 20) ftPerHour = 10; // Hard cap fallback

        const hours = Math.ceil(length / ftPerHour);
        const days = Math.ceil(hours / 10); // 10 hour days

        // Add Crew Day
        await addEstimateLine({
            estimateId,
            description: `Drill Crew (4-man) - ${soil} Conditions (${Math.round(ftPerHour)} ft/hr)`,
            quantity: hours,
            unit: 'HR',
            unitCost: 350.00, // Blended rate
            markup: 0.20
        });

        // Add Rig
        let rigSize = 'D24x40';
        if (diameter > 8 || length > 800) rigSize = 'D100x140';

        await addEstimateLine({
            estimateId,
            description: `Drill Rig (${rigSize})`,
            quantity: hours,
            unit: 'HR',
            unitCost: rigSize === 'D24x40' ? 150 : 450,
            markup: 0.15
        });

        // 3. Fluids
        if (plan.fluidPlan?.totalVolume) {
            // Bentonite bags (approx 50lb bag per 300 gal for normal mix)
            const bags = Math.ceil(plan.fluidPlan.totalVolume / 300);
            await addEstimateLine({
                estimateId,
                description: 'Bentonite (50lb Bags)',
                quantity: bags,
                unit: 'Bag',
                unitCost: 18.50,
                markup: 0.15
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Failed to generate assembly:', error);
        return { success: false, error: 'Failed to generate assembly' };
    }
}

export async function getEstimates() {
    try {
        const estimates = await prisma.estimate.findMany({
            orderBy: { createdAt: 'desc' },
            include: { project: true },
        });
        return { success: true, data: estimates };
    } catch (error) {
        return { success: false, error: 'Failed to fetch estimates' };
    }
}

export async function getEstimate(id: string) {
    try {
        const estimate = await prisma.estimate.findUnique({
            where: { id },
            include: {
                project: true,
                lines: {
                    orderBy: { lineNumber: 'asc' }
                }
            },
        });
        return { success: true, data: estimate };
    } catch (error) {
        return { success: false, error: 'Failed to fetch estimate' };
    }
}

export async function getProjectsForEstimating() {
    try {
        const projects = await prisma.project.findMany({
            where: { bores: { some: {} } }, // Only projects with bores
            include: { bores: true },
            orderBy: { updatedAt: 'desc' }
        });
        return { success: true, data: projects };
    } catch (error) {
        return { success: false, error: 'Failed to fetch projects' };
    }
}
