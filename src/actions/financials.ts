"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const timeCardSchema = z.object({
    employeeId: z.string(),
    projectId: z.string(),
    date: z.date(),
    entries: z.array(z.object({
        hours: z.number(),
        code: z.string(),
        payrollItem: z.string().optional(),
        serviceItem: z.string().optional(),
        notes: z.string().optional(),
    })),
});

export async function createTimeCards(data: z.infer<typeof timeCardSchema>) {
    try {
        // Transaction to ensure all entries for the day are saved
        const result = await prisma.$transaction(
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

        revalidatePath(`/projects/${data.projectId}`);
        return { success: true, count: result.length };
    } catch (error) {
        console.error("Failed to create time cards:", error);
        return { success: false, error: "Failed to create time cards" };
    }
}

export async function getProjectBurnRate(projectId: string) {
    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                timeCards: {
                    include: { employee: true },
                },
                bores: {
                    include: {
                        telemetryLogs: true // Using telemetry logs to estimate drill hours if needed, or just use timeCards with "Drilling" code
                    }
                }
            },
        });

        if (!project) return { success: false, error: "Project not found" };

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
        // Assumption: "Drilling" code in TimeCard represents drill hours, OR we use a separate log.
        // For simplicity, let's sum up hours where code == "Drilling"
        const drillHours = project.timeCards
            .filter(tc => tc.code === "Drilling")
            .reduce((acc, curr) => acc + (curr.hours || 0), 0);

        const machineRate = project.machineRate || 150; // Default $150/hr
        const totalMachineCost = drillHours * machineRate;

        const totalCost = totalLaborCost + totalMachineCost;

        return {
            success: true,
            data: {
                totalCost,
                totalLaborCost,
                totalMachineCost,
                totalManHours,
                drillHours,
                machineRate,
            },
        };
    } catch (error) {
        console.error("Failed to calculate burn rate:", error);
        return { success: false, error: "Failed to calculate burn rate" };
    }
}

export async function getProjectFinancials(projectId: string) {
    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                timeCards: { include: { employee: true } },
                inventoryTransactions: { include: { item: true } },
                assets: true,
                expenses: true,
            }
        });

        if (!project) return { success: false, error: "Project not found" };

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
                // The schema has costPerUnit on InventoryItem.
                // InventoryTransaction doesn't seem to have unitCost in the current schema version I see in lint, 
                // or maybe it does but I need to check. 
                // Based on lint: Property 'unitCost' does not exist.
                // So I will just use item.costPerUnit.
                const cost = tx.item.costPerUnit || 0;
                actualMaterials += Math.abs(tx.quantity) * cost;
            }
        });

        // Calculate Equipment (Assets)
        const drillHours = project.timeCards
            .filter(tc => tc.code === "Drilling")
            .reduce((acc, curr) => acc + (curr.hours || 0), 0);
        const actualEquipment = drillHours * (project.machineRate || 150);

        // Calculate Expenses (New Model)
        let expenseTotal = 0;
        project.expenses.forEach(exp => {
            expenseTotal += exp.amount;
        });

        const actualTotal = actualLabor + actualMaterials + actualEquipment + expenseTotal;

        // 2. Calculate Estimates (Mock/Placeholder or from Project fields)
        // In a real app, we'd query the Estimate model.
        const estimatedRevenue = project.budget || 50000;
        const estimatedLabor = estimatedRevenue * 0.3; // 30%
        const estimatedMaterials = estimatedRevenue * 0.2; // 20%
        const estimatedEquipment = estimatedRevenue * 0.2; // 20%
        const estimatedTotal = estimatedLabor + estimatedMaterials + estimatedEquipment;

        // 3. Profit & Margin
        const profit = estimatedRevenue - actualTotal;
        const margin = (profit / estimatedRevenue) * 100;

        return {
            success: true,
            data: {
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
            }
        };

    } catch (error) {
        console.error("Failed to get project financials:", error);
        return { success: false, error: "Failed to get project financials" };
    }
}
