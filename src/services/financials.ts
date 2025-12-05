import { prisma } from '@/lib/prisma';
import { CreateTimeCardInput } from '@/schemas/financials';

export class FinancialsService {

    static async createTimeCards(data: CreateTimeCardInput) {
        return await prisma.$transaction(
            data.entries.map((entry) =>
                prisma.timeCard.create({
                    data: {
                        employeeId: data.employeeId,
                        projectId: data.projectId,
                        periodStart: data.date,
                        periodEnd: data.date,
                        date: data.date,
                        hours: entry.hours,
                        code: entry.code,
                        payrollItem: entry.payrollItem,
                        serviceItem: entry.serviceItem,
                        notes: entry.notes,
                    },
                })
            )
        );
    }

    static async getProjectBurnRate(projectId: string) {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                timeCards: {
                    include: { employee: true },
                },
                bores: {
                    include: {
                        telemetryLogs: true
                    }
                }
            },
        });

        if (!project) throw new Error("Project not found");

        // Calculate Labor Cost
        let totalLaborCost = 0;
        let totalManHours = 0;

        project.timeCards.forEach(tc => {
            const emp = tc.employee as any;
            const rate = (emp.hourlyRate || 0) + (emp.burdenRate || 0);
            totalLaborCost += (tc.hours || 0) * rate;
            totalManHours += (tc.hours || 0);
        });

        // Calculate Machine Cost
        const drillHours = project.timeCards
            .filter(tc => tc.code === "Drilling")
            .reduce((acc, curr) => acc + (curr.hours || 0), 0);

        const machineRate = project.machineRate || 150;
        const totalMachineCost = drillHours * machineRate;

        const totalCost = totalLaborCost + totalMachineCost;

        return {
            totalCost,
            totalLaborCost,
            totalMachineCost,
            totalManHours,
            drillHours,
            machineRate,
        };
    }

    static async getProjectFinancials(projectId: string) {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                timeCards: { include: { employee: true } },
                inventoryTransactions: { include: { item: true } },
                assets: true,
                expenses: true,
            }
        });

        if (!project) throw new Error("Project not found");

        // 1. Calculate Actuals
        let actualLabor = 0;
        project.timeCards.forEach(tc => {
            const emp = tc.employee as any;
            const rate = (emp.hourlyRate || 0) + (emp.burdenRate || 0);
            actualLabor += (tc.hours || 0) * rate;
        });

        // Calculate Materials (Inventory)
        let actualMaterials = 0;
        project.inventoryTransactions.forEach(tx => {
            if (tx.quantity < 0) { // Usage
                const cost = tx.item.costPerUnit || 0;
                actualMaterials += Math.abs(tx.quantity) * cost;
            }
        });

        // Calculate Equipment (Assets)
        const drillHours = project.timeCards
            .filter(tc => tc.code === "Drilling")
            .reduce((acc, curr) => acc + (curr.hours || 0), 0);
        const actualEquipment = drillHours * (project.machineRate || 150);

        // Calculate Expenses
        let expenseTotal = 0;
        project.expenses.forEach(exp => {
            expenseTotal += exp.amount;
        });

        const actualTotal = actualLabor + actualMaterials + actualEquipment + expenseTotal;

        // 2. Calculate Estimates
        const estimatedRevenue = project.budget || 50000;
        const estimatedLabor = estimatedRevenue * 0.3; // 30%
        const estimatedMaterials = estimatedRevenue * 0.2; // 20%
        const estimatedEquipment = estimatedRevenue * 0.2; // 20%
        const estimatedTotal = estimatedLabor + estimatedMaterials + estimatedEquipment;

        // 3. Profit & Margin
        const profit = estimatedRevenue - actualTotal;
        const margin = (profit / estimatedRevenue) * 100;

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
