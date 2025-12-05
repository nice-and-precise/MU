import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FinancialsService } from '@/services/financials';
import { prisma } from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        project: {
            findUnique: vi.fn(),
        },
        timeCard: {
            create: vi.fn(),
        },
        $transaction: vi.fn((ops) => Promise.all(ops)),
    }
}));

describe('FinancialsService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getProjectBurnRate', () => {
        it('should calculate burn rate correctly', async () => {
            const projectId = 'proj-1';
            const mockProject = {
                id: projectId,
                machineRate: 100,
                timeCards: [
                    {
                        hours: 10,
                        code: 'Drilling',
                        employee: { hourlyRate: 20, burdenRate: 5 }
                    },
                    {
                        hours: 5,
                        code: 'Labor',
                        employee: { hourlyRate: 15, burdenRate: 5 }
                    }
                ],
                bores: []
            };

            (prisma.project.findUnique as any).mockResolvedValue(mockProject);

            const result = await FinancialsService.getProjectBurnRate(projectId);

            // Labor Cost: (10 * 25) + (5 * 20) = 250 + 100 = 350
            // Machine Cost: 10 * 100 = 1000
            // Total Cost: 1350

            expect(result.totalLaborCost).toBe(350);
            expect(result.totalMachineCost).toBe(1000);
            expect(result.totalCost).toBe(1350);
            expect(result.drillHours).toBe(10);
        });

        it('should throw error if project not found', async () => {
            (prisma.project.findUnique as any).mockResolvedValue(null);
            await expect(FinancialsService.getProjectBurnRate('invalid')).rejects.toThrow('Project not found');
        });
    });

    describe('getProjectFinancials', () => {
        it('should calculate financials correctly', async () => {
            const projectId = 'proj-1';
            const mockProject = {
                id: projectId,
                budget: 10000,
                machineRate: 100,
                timeCards: [
                    { hours: 10, code: 'Drilling', employee: { hourlyRate: 20, burdenRate: 5 } }
                ],
                inventoryTransactions: [
                    { quantity: -5, item: { costPerUnit: 10 } } // Usage: 5 * 10 = 50
                ],
                assets: [],
                expenses: [
                    { amount: 200 }
                ]
            };

            (prisma.project.findUnique as any).mockResolvedValue(mockProject);

            const result = await FinancialsService.getProjectFinancials(projectId);

            // Actuals:
            // Labor: 10 * 25 = 250
            // Materials: 50
            // Equipment: 10 * 100 = 1000
            // Expenses: 200
            // Total Actual: 1500

            // Estimated:
            // Revenue: 10000
            // Profit: 10000 - 1500 = 8500
            // Margin: 85%

            expect(result.actuals.totalCost).toBe(1500);
            expect(result.actuals.labor).toBe(250);
            expect(result.actuals.materials).toBe(50);
            expect(result.profit).toBe(8500);
            expect(result.margin).toBe(85);
        });
    });
});
