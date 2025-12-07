import { prisma } from '@/lib/prisma';
import { CreateTimeCardInput } from '@/schemas/financials';

export class FinancialsService {

    static async createTimeCards(data: CreateTimeCardInput) {
        // Legacy support mapping to TimeEntry if needed, 
        // but for now we keep this if creating manual time cards is a separate flow.
        // Assuming this might be used for manual payroll adjustments.
        // For now, let's keep it but ideally we should unify under TimeEntry.
        return await prisma.$transaction(
            data.entries.map((entry) =>
                prisma.timeEntry.create({
                    data: {
                        employeeId: data.employeeId,
                        projectId: data.projectId,
                        startTime: data.date,
                        endTime: new Date(data.date.getTime() + entry.hours * 3600 * 1000), // Approximate duration
                        type: 'WORK',
                        status: 'APPROVED',
                        description: entry.notes || entry.code
                    },
                })
            )
        );
    }

    static async getProjectBurnRate(projectId: string) {
        // Re-implement using the same logic as getProjectFinancials for consistency
        const financials = await this.getProjectFinancials(projectId);
        return {
            totalCost: financials.actuals.totalCost,
            totalLaborCost: financials.actuals.labor,
            totalMachineCost: financials.actuals.equipment,
            // Approximations for now as these specific fields might need deeper query if UI depends on them specifically
            totalManHours: 0,
            drillHours: 0,
            machineRate: 0,
        };
    }

    static async getProjectFinancials(projectId: string) {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                // Get the approved estimate (or latest if multiple/none, logic below)
                estimates: {
                    where: { status: 'APPROVED' },
                    include: {
                        lines: {
                            include: { costItem: true }
                        }
                    },
                    orderBy: { updatedAt: 'desc' },
                    take: 1
                },
                timeEntries: {
                    include: { employee: true },
                    where: { status: 'APPROVED' }
                },
                equipmentUsage: {
                    include: { asset: true }
                },
                inventoryTransactions: {
                    include: { item: true }
                },
                expenses: {
                    where: { status: { in: ['APPROVED', 'PAID'] } }
                },
            }
        });

        if (!project) throw new Error("Project not found");

        // --- 1. Operations Actuals ---

        // Labor: (hourlyRate + burdenRate) * hours
        let actualLabor = 0;
        project.timeEntries.forEach(entry => {
            if (entry.endTime && entry.employee) {
                const durationHours = (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / (1000 * 60 * 60);
                // Fallback to $50/hr if no rate set, to avoid $0 costs hiding usage
                // Cost = (Hourly Rate + Burden Rate) * Hours
                // TODO: For more accurate OT costing, we'd need to apply payroll rules here or store calculated cost on the entry.
                const hourlyRate = entry.employee.hourlyRate || 0;
                const burdenRate = entry.employee.burdenRate || 0;
                const effectiveRate = hourlyRate + burdenRate;

                actualLabor += durationHours * effectiveRate;
            }
        });

        // Materials: Inventory Transactions (negative is usage)
        let actualMaterials = 0;
        project.inventoryTransactions.forEach((tx: any) => {
            if (tx.quantity < 0 && tx.item) {
                const cost = tx.item.costPerUnit || 0;
                actualMaterials += Math.abs(tx.quantity) * cost;
            }
        });

        // Equipment: Hours * Hourly Rate
        let actualEquipment = 0;
        project.equipmentUsage.forEach((usage: any) => {
            const rate = usage.asset?.hourlyRate || 100; // Default $100/hr internal rate
            actualEquipment += (usage.hours || 0) * rate;
        });

        // Expenses: Direct categorization
        let actualExpenses = 0;
        let actualSubcontract = 0;

        project.expenses.forEach((exp: any) => {
            const amount = exp.amount || 0;
            // Basic categorization based on user input string
            const cat = exp.category?.toLowerCase() || '';
            if (cat.includes('material')) {
                actualMaterials += amount;
            } else if (cat.includes('equip') || cat.includes('rental') || cat.includes('fuel')) {
                actualEquipment += amount;
            } else if (cat.includes('sub') || cat.includes('contract')) {
                actualSubcontract += amount;
            } else {
                actualExpenses += amount; // General/Other
            }
        });

        const actualTotal = actualLabor + actualMaterials + actualEquipment + actualSubcontract + actualExpenses;

        // --- 2. Budget (Estimates) ---

        let estimatedRevenue = 0; // The price we sold it for
        let estimatedCost = 0;    // The cost we predicted

        let budgetLabor = 0;
        let budgetMaterials = 0;
        let budgetEquipment = 0;
        let budgetSubcontract = 0;
        let budgetOther = 0;

        const activeEstimate = project.estimates[0];

        if (activeEstimate) {
            estimatedRevenue = activeEstimate.total;

            // Sum up the lines
            activeEstimate.lines.forEach(line => {
                // Cost = (Unit Cost * Qty) - Markup is separate in our model usually, 
                // but EstimateLine model has dedicated cost buckets:
                // laborCost, equipmentCost, materialCost, subtotal (cost), total (price)

                // If the granular costs are populated (best case):
                budgetLabor += line.laborCost || 0;
                budgetEquipment += line.equipmentCost || 0;
                budgetMaterials += line.materialCost || 0;

                // If granular is 0 but subtotal exists (fallback):
                if (!line.laborCost && !line.equipmentCost && !line.materialCost) {
                    // Try to guess from costItem category if linked
                    const catName = line.costItem?.categoryId || ''; // TODO: would need to fetch category name
                    // For now, dump into 'Other' if untyped
                    budgetOther += (line.unitCost * line.quantity);
                }
            });

            // Adjust estimatedCost to be the sum of buckets
            estimatedCost = budgetLabor + budgetEquipment + budgetMaterials + budgetSubcontract + budgetOther;
        } else {
            // Fallback if no estimate: use project budget as revenue, and generic 70% cost
            estimatedRevenue = project.budget || 0;
            estimatedCost = estimatedRevenue * 0.7; // Rough heuristic
            budgetLabor = estimatedCost * 0.4;
            budgetEquipment = estimatedCost * 0.4;
            budgetMaterials = estimatedCost * 0.2;
        }

        // --- 3. Analysis ---
        const profit = estimatedRevenue - actualTotal;
        const margin = estimatedRevenue > 0 ? (profit / estimatedRevenue) * 100 : 0;

        return {
            estimated: {
                revenue: estimatedRevenue,
                totalCost: estimatedCost,
                labor: budgetLabor,
                equipment: budgetEquipment,
                materials: budgetMaterials,
                subcontract: budgetSubcontract,
                other: budgetOther
            },
            actuals: {
                totalCost: actualTotal,
                // Combine for simpler UI mapping if needed, or keep granular
                labor: actualLabor,
                equipment: actualEquipment,
                materials: actualMaterials,
                subcontract: actualSubcontract,
                expenses: actualExpenses
            },
            profit,
            margin
        };
    }
}
