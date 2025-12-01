'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Constants for default rates (in a real app, these would be in a settings table)
const RATES = {
    LABOR: {
        Foreman: 85,
        Operator: 75,
        Labor: 45,
        Driver: 55,
        Default: 50,
    },
    EQUIPMENT: {
        DrillRig: 150, // Hourly rate for the rig
    }
};

export async function getProjectFinancials(projectId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        // 1. Fetch Active Estimate (WON or SENT)
        const estimate = await prisma.estimate.findFirst({
            where: {
                projectId,
                status: { in: ['WON', 'SENT'] }
            },
            include: { lines: true },
            orderBy: { updatedAt: 'desc' }
        });

        // 2. Fetch Approved Daily Reports
        const reports = await prisma.dailyReport.findMany({
            where: {
                projectId,
                status: 'APPROVED'
            }
        });

        // 3. Calculate Estimated Costs
        let estimated = {
            revenue: 0,
            labor: 0,
            equipment: 0,
            materials: 0,
            totalCost: 0,
        };

        if (estimate) {
            estimated.revenue = estimate.total;
            estimate.lines.forEach(line => {
                estimated.labor += line.laborCost || 0;
                estimated.equipment += line.equipmentCost || 0;
                estimated.materials += line.materialCost || 0;
                // If costs aren't broken down, we might estimate them from total? 
                // For now, assume they are populated or 0.
                // If 0, maybe fallback to a percentage? Let's stick to direct values.
            });
            estimated.totalCost = estimated.labor + estimated.equipment + estimated.materials;

            // If line item costs are 0 (user didn't enter breakdown), use subtotal as cost basis?
            // Or just show 0. Let's show 0 to encourage better data entry.
        }

        // 4. Calculate Actual Costs
        let actuals = {
            labor: 0,
            equipment: 0,
            materials: 0,
            totalCost: 0,
        };

        // We need inventory items to price materials
        const inventoryItems = await prisma.inventoryItem.findMany();
        const itemMap = new Map(inventoryItems.map(i => [i.id, i]));

        for (const report of reports) {
            // Labor & Equipment (Derived from Crew)
            const crew = JSON.parse(report.crew || '[]');
            let drillHours = 0;

            crew.forEach((member: any) => {
                const rate = RATES.LABOR[member.role as keyof typeof RATES.LABOR] || RATES.LABOR.Default;
                actuals.labor += (member.hours || 0) * rate;

                // Assume Operator hours = Drill Rig hours
                if (member.role === 'Operator') {
                    drillHours = Math.max(drillHours, member.hours || 0);
                }
            });

            actuals.equipment += drillHours * RATES.EQUIPMENT.DrillRig;

            // Materials
            const materials = JSON.parse(report.materials || '[]');
            materials.forEach((mat: any) => {
                const item = itemMap.get(mat.inventoryItemId);
                if (item && item.costPerUnit) {
                    actuals.materials += (mat.quantity || 0) * item.costPerUnit;
                }
            });
        }

        actuals.totalCost = actuals.labor + actuals.equipment + actuals.materials;

        // 5. Calculate Variance & Profit
        const profit = estimated.revenue - actuals.totalCost;
        const margin = estimated.revenue > 0 ? (profit / estimated.revenue) * 100 : 0;

        return {
            success: true,
            data: {
                estimated,
                actuals,
                profit,
                margin,
                currency: 'USD'
            }
        };

    } catch (error) {
        console.error('Failed to get project financials:', error);
        return { success: false, error: 'Failed to calculate financials' };
    }
}
