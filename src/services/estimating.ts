import { prisma } from '@/lib/prisma';
import { CreateEstimateSchema, CreateEstimateFromItemsSchema, UpdateEstimateSchema, CreateEstimateItemSchema } from '@/schemas/estimating';
import { z } from 'zod';

export type CreateEstimateInput = z.infer<typeof CreateEstimateSchema>;
export type CreateEstimateFromItemsInput = z.infer<typeof CreateEstimateFromItemsSchema>;
export type UpdateEstimateInput = z.infer<typeof UpdateEstimateSchema>;
export type CreateLineItemInput = z.infer<typeof CreateEstimateItemSchema>;

export class EstimatingService {

    static async createEstimate(userId: string, data: CreateEstimateInput) {
        return await prisma.estimate.create({
            data: {
                ...data,
                createdById: userId,
                status: 'DRAFT',
            },
        });
    }

    static async createEstimateFromItems(userId: string, data: CreateEstimateFromItemsInput) {
        // 1. Create the Estimate
        const estimate = await prisma.estimate.create({
            data: {
                name: data.name,
                status: 'DRAFT',
                createdById: userId,
                subtotal: 0,
                total: 0
            }
        });

        // 2. Create Line Items
        let lineNumber = 1;
        let subtotal = 0;
        let total = 0;

        for (const item of data.items) {
            const lineSubtotal = item.quantity * item.unitCost;
            const lineTotal = lineSubtotal; // Assuming no markup for imported items initially

            await prisma.estimateLine.create({
                data: {
                    estimateId: estimate.id,
                    lineNumber: lineNumber++,
                    description: item.description,
                    quantity: item.quantity,
                    unit: item.unit,
                    unitCost: item.unitCost,
                    subtotal: lineSubtotal,
                    total: lineTotal,
                    markup: item.markup || 0,
                    laborCost: item.laborCost || 0,
                    equipmentCost: item.equipmentCost || 0,
                    materialCost: item.materialCost || 0,
                }
            });

            subtotal += lineSubtotal;
            total += lineTotal;
        }

        // 3. Update Totals
        return await prisma.estimate.update({
            where: { id: estimate.id },
            data: { subtotal, total }
        });
    }

    static async getEstimate(id: string) {
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

    static async updateEstimate(id: string, data: UpdateEstimateInput) {
        return await prisma.estimate.update({
            where: { id },
            data,
        });
    }

    static async addLineItem(estimateId: string, data: CreateLineItemInput) {
        // Get current max line number
        const maxLine = await prisma.estimateLine.aggregate({
            where: { estimateId },
            _max: { lineNumber: true },
        });
        const nextLineNumber = (maxLine._max.lineNumber || 0) + 1;

        // Calculate totals
        const subtotal = data.quantity * data.unitCost;
        const total = subtotal * (1 + (data.markup || 0));

        const line = await prisma.estimateLine.create({
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
                laborCost: data.laborCost || 0,
                equipmentCost: data.equipmentCost || 0,
                materialCost: data.materialCost || 0,
            },
        });

        await this.recalculateEstimateTotals(estimateId);
        return line;
    }

    static async updateLineItem(id: string, data: Partial<CreateLineItemInput>) {
        // We need to fetch the existing line to calculate totals correctly if only some fields are updated
        // For simplicity, we assume the action passes enough context or we fetch it.
        // But for "turbo" mode, let's assume we get the full necessary data or we fetch it.
        const existing = await prisma.estimateLine.findUnique({ where: { id } });
        if (!existing) throw new Error("Line item not found");

        const quantity = data.quantity ?? existing.quantity;
        const unitCost = data.unitCost ?? existing.unitCost;
        const markup = data.markup ?? existing.markup;

        const subtotal = quantity * unitCost;
        const total = subtotal * (1 + markup);

        const line = await prisma.estimateLine.update({
            where: { id },
            data: {
                ...data,
                subtotal,
                total,
            },
        });

        await this.recalculateEstimateTotals(line.estimateId);
        return line;
    }

    static async deleteLineItem(id: string) {
        const line = await prisma.estimateLine.delete({ where: { id } });
        await this.recalculateEstimateTotals(line.estimateId);
        return line;
    }

    static async duplicateEstimate(userId: string, id: string) {
        const original = await prisma.estimate.findUnique({
            where: { id },
            include: { lines: true }
        });

        if (!original) throw new Error('Estimate not found');

        return await prisma.estimate.create({
            data: {
                name: `${original.name} (Copy)`,
                description: original.description,
                customerName: original.customerName,
                customerEmail: original.customerEmail,
                customerPhone: original.customerPhone,
                status: 'DRAFT',
                createdById: userId,
                subtotal: original.subtotal,
                markupPercent: original.markupPercent,
                markupAmount: original.markupAmount,
                taxPercent: original.taxPercent,
                taxAmount: original.taxAmount,
                total: original.total,
                notes: original.notes,
                terms: original.terms,
                lines: {
                    create: original.lines.map(line => ({
                        lineNumber: line.lineNumber,
                        description: line.description,
                        quantity: line.quantity,
                        unit: line.unit,
                        unitCost: line.unitCost,
                        laborCost: line.laborCost,
                        equipmentCost: line.equipmentCost,
                        materialCost: line.materialCost,
                        subtotal: line.subtotal,
                        markup: line.markup,
                        total: line.total,
                        costItemId: line.costItemId
                    }))
                }
            }
        });
    }

    static async convertEstimateToProject(userId: string, id: string) {
        const estimate = await prisma.estimate.findUnique({
            where: { id },
            include: { lines: true }
        });

        if (!estimate) throw new Error('Estimate not found');

        // Create Project
        const project = await prisma.project.create({
            data: {
                name: estimate.name,
                description: estimate.description,
                customerName: estimate.customerName,
                budget: estimate.total,
                status: 'PLANNING',
                createdById: userId,
            }
        });

        // Link Estimate to Project
        await prisma.estimate.update({
            where: { id },
            data: { projectId: project.id, status: 'APPROVED' }
        });

        // Create Bores from Line Items (Simple Heuristic)
        const drillLines = estimate.lines.filter(l =>
            l.description.toLowerCase().includes('drill') ||
            l.description.toLowerCase().includes('bore')
        );

        for (const line of drillLines) {
            await prisma.bore.create({
                data: {
                    projectId: project.id,
                    name: `Bore from Line ${line.lineNumber}`,
                    productMaterial: line.description,
                    totalLength: line.quantity,
                    status: 'PLANNED'
                }
            });
        }

        return project;
    }

    private static async recalculateEstimateTotals(estimateId: string) {
        const lines = await prisma.estimateLine.findMany({ where: { estimateId } });

        const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
        const total = lines.reduce((sum, line) => sum + line.total, 0);
        const markupAmount = total - subtotal;

        await prisma.estimate.update({
            where: { id: estimateId },
            data: {
                subtotal,
                markupAmount,
                total,
            },
        });
    }

    static async getCostItems() {
        return await prisma.costItem.findMany({
            orderBy: { code: 'asc' }
        });
    }
}
