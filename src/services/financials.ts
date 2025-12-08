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

        // Labor: Calculated via helper below
        // let actualLabor = 0;

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

        // --- 1. Operations Actuals ---

        // Helper to calculate labor cost with burden and OT
        const calculateLaborCost = async (entries: any[]) => {
            // Group by employee to apply OT rules
            const entriesByEmployee = new Map<string, any[]>();
            entries.forEach(e => {
                if (!entriesByEmployee.has(e.employeeId)) entriesByEmployee.set(e.employeeId, []);
                entriesByEmployee.get(e.employeeId)?.push(e);
            });

            let totalLaborCost = 0;

            for (const [empId, empEntries] of entriesByEmployee) {
                // Determine rules from employee record
                const employee = empEntries[0].employee;
                if (!employee) continue;

                const baseRate = employee.hourlyRate || 0;
                const burdenRate = employee.burdenRate || 0;
                const otMult = employee.defaultOvertimeMultiplier || 1.5;
                const dtMult = employee.doubleTimeMultiplier || 2.0;
                const otRule = employee.overtimeRule || 'OVER_40_WEEK'; // Default to standard

                // Simple bucket tracking
                let weeklyRegularMins = 0;
                let cost = 0;

                // Sort by time to process correctly
                empEntries.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

                // We need to reset weekly counter on week boundaries
                // Check if entries span multiple weeks (simple logic: process sequentially)
                let currentWeekStart = -1;

                for (const entry of empEntries) {
                    if (!entry.endTime) continue;
                    const dayStart = new Date(entry.startTime);
                    const weekStart = new Date(dayStart);
                    weekStart.setHours(0, 0, 0, 0);
                    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)

                    if (weekStart.getTime() !== currentWeekStart) {
                        weeklyRegularMins = 0; // New week, reset counter
                        currentWeekStart = weekStart.getTime();
                    }

                    const durationMins = (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / (1000 * 60);
                    let regularMins = 0;
                    let otMins = 0;
                    let dtMins = 0;

                    // Daily Rules
                    if (otRule === 'OVER_8_DAY' || otRule === 'UNION_X') {
                        const dtThresholdMins = (employee.doubleTimeDailyThreshold || 12) * 60;
                        const otThresholdMins = 8 * 60;

                        if (durationMins > dtThresholdMins) {
                            dtMins = durationMins - dtThresholdMins;
                            otMins = dtThresholdMins - otThresholdMins;
                            regularMins = otThresholdMins;
                        } else if (durationMins > otThresholdMins) {
                            otMins = durationMins - otThresholdMins;
                            regularMins = otThresholdMins;
                        } else {
                            regularMins = durationMins;
                        }
                    } else {
                        // Standard: everything counts towards weekly bucket first
                        regularMins = durationMins;
                    }

                    // Apply Weekly Rule (Retroactive OT)
                    // If adding these regular mins pushes us over 40h (2400 mins)
                    if (weeklyRegularMins + regularMins > 2400) {
                        const availableRegular = Math.max(0, 2400 - weeklyRegularMins);
                        const overflow = (weeklyRegularMins + regularMins) - 2400;

                        // If we are using standard rule, the overflow becomes OT
                        // If we are using DAILY rule, we've already paid OT for daily excess, 
                        // but 40h rule usually catches "6th day" scenarios where daily didn't trigger.
                        // For simplicity in this v1: 
                        // - Standard: overflow is OT
                        // - Daily: overflow is OT (if not already accounted for? Complicated. 
                        //   Let's assume standard "whichever is greater" logic, but summing cost is tricky line-by-line).
                        //   SIMPLIFICATION: Just add overflow to OT if it wasn't already OT.

                        if (otRule === 'OVER_40_WEEK') {
                            regularMins = availableRegular;
                            otMins += overflow;
                        }
                    }

                    weeklyRegularMins += regularMins;

                    // Calculate Cost for this Entry
                    // Burden is usually applied to ALL hours equally, or just straight time? 
                    // Usually Burden (FICA, Ins) is on the wages paid.
                    // Let's assume Burden is a flat $/hr add-on to Base Rate for internal costing (simpler).
                    // Or is Burden a multiplier? "burdenRate" field is Float. Assuming $/hr.

                    // Cost = (Hours * (Base * Multiplier)) + (Hours * Burden)
                    // Actually, Burden applies to the hour worked regardless of OT usually (e.g. truck cost, insurance).
                    // But payroll taxes scale with pay. 
                    // Let's use: Total Pay + (Total Hours * Burden Payment)

                    const pay = (regularMins / 60 * baseRate) +
                        (otMins / 60 * baseRate * otMult) +
                        (dtMins / 60 * baseRate * dtMult);

                    const burden = (durationMins / 60 * burdenRate);

                    cost += (pay + burden);
                }
                totalLaborCost += cost;
            }
            return totalLaborCost;
        };

        const actualLabor = await calculateLaborCost(project.timeEntries);
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
