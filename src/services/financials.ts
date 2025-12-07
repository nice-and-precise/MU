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
                expenses: true,
            }
        });

        if (!project) throw new Error("Project not found");

        // 1. Calculate Actuals

        // Labor: Sum(hours * (hourlyRate + burdenRate))
        let actualLabor = 0;
        project.timeEntries.forEach(entry => {
            if (entry.endTime && entry.employee) {
                const hours = (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / (1000 * 60 * 60);
                const rate = (entry.employee.hourlyRate || 0) + (entry.employee.burdenRate || 0);
                actualLabor += hours * rate;
            }
        });

        // Materials: Sum(abs(quantity) * costPerUnit) for usage transactions (negative qty)
        let actualMaterials = 0;
        project.inventoryTransactions.forEach((tx: any) => {
            if (tx.quantity < 0 && tx.item) {
                const cost = tx.item.costPerUnit || 0;
                actualMaterials += Math.abs(tx.quantity) * cost;
            }
        });

        // Equipment: Sum(hours * hourlyRate) from EquipmentUsage
        let actualEquipment = 0;
        project.equipmentUsage.forEach((usage: any) => {
            const rate = usage.asset?.hourlyRate || 150;
            actualEquipment += (usage.hours || 0) * rate;
        });

        // Expenses: Sum(amount)
        let expenseTotal = 0;
        project.expenses.forEach((exp: any) => {
            if (exp.status === 'APPROVED' || exp.status === 'PAID') {
                expenseTotal += exp.amount;
            }
        });

        const actualTotal = actualLabor + actualMaterials + actualEquipment + expenseTotal;

        // 2. Calculate Estimates
        const estimatedRevenue = project.budget || 0;

        const estimatedLabor = estimatedRevenue * 0.3; // 30%
        const estimatedMaterials = estimatedRevenue * 0.25; // 25%
        const estimatedEquipment = estimatedRevenue * 0.25; // 25%
        const estimatedExpenses = estimatedRevenue * 0.05; // 5%
        const estimatedTotal = estimatedLabor + estimatedMaterials + estimatedEquipment + estimatedExpenses;

        // 3. Profit & Margin
        const profit = estimatedRevenue - actualTotal;
        const margin = estimatedRevenue > 0 ? (profit / estimatedRevenue) * 100 : 0;

        return {
            estimated: {
                revenue: estimatedRevenue,
                totalCost: estimatedTotal,
                labor: estimatedLabor,
                equipment: estimatedEquipment,
                materials: estimatedMaterials
            },
            actuals: {
                totalCost: actualTotal,
                labor: actualLabor,
                equipment: actualEquipment,
                materials: actualMaterials,
                expenses: expenseTotal,
            },
            profit,
            margin
        };
    }
}
