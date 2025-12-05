import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EstimatingService } from '@/services/estimating';
import { prisma } from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        estimate: {
            create: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        estimateLine: {
            create: vi.fn(),
            aggregate: vi.fn(),
            findMany: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            findUnique: vi.fn(),
        },
        project: {
            create: vi.fn(),
        },
        bore: {
            create: vi.fn(),
        }
    }
}));

describe('EstimatingService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createEstimate', () => {
        it('should create an estimate with correct data', async () => {
            const mockEstimate = { id: '1', name: 'Test Estimate', status: 'DRAFT' };
            (prisma.estimate.create as any).mockResolvedValue(mockEstimate);

            const result = await EstimatingService.createEstimate('user-1', { name: 'Test Estimate' });

            expect(prisma.estimate.create).toHaveBeenCalledWith({
                data: {
                    name: 'Test Estimate',
                    createdById: 'user-1',
                    status: 'DRAFT'
                }
            });
            expect(result).toEqual(mockEstimate);
        });
    });

    describe('addLineItem', () => {
        it('should add a line item and recalculate totals', async () => {
            const estimateId = 'est-1';
            const input = {
                description: 'Test Item',
                quantity: 10,
                unit: 'LF',
                unitCost: 100,
                markup: 0.1,
                laborCost: 0,
                equipmentCost: 0,
                materialCost: 0
            };

            // Mock aggregate for line number
            (prisma.estimateLine.aggregate as any).mockResolvedValue({ _max: { lineNumber: 0 } });

            // Mock create
            (prisma.estimateLine.create as any).mockResolvedValue({ id: 'line-1', ...input });

            // Mock findMany for recalculation
            (prisma.estimateLine.findMany as any).mockResolvedValue([
                { subtotal: 1000, total: 1100 }
            ]);

            await EstimatingService.addLineItem(estimateId, input);

            // Verify create
            expect(prisma.estimateLine.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    estimateId,
                    lineNumber: 1,
                    description: 'Test Item',
                    subtotal: 1000, // 10 * 100
                    total: 1100,    // 1000 * 1.1
                })
            });

            // Verify update (recalculation)
            expect(prisma.estimate.update).toHaveBeenCalledWith({
                where: { id: estimateId },
                data: {
                    subtotal: 1000,
                    markupAmount: 100,
                    total: 1100
                }
            });
        });
    });

    describe('createEstimateFromItems', () => {
        it('should create estimate and lines from bulk items', async () => {
            const items = [
                { description: 'Item 1', quantity: 10, unit: 'EA', unitCost: 50, markup: 0, laborCost: 0, equipmentCost: 0, materialCost: 0 },
                { description: 'Item 2', quantity: 5, unit: 'EA', unitCost: 20, markup: 0, laborCost: 0, equipmentCost: 0, materialCost: 0 }
            ];

            const mockEstimate = { id: 'est-bulk', name: 'Bulk Est' };
            (prisma.estimate.create as any).mockResolvedValue(mockEstimate);

            // Mock update to return the final estimate
            (prisma.estimate.update as any).mockResolvedValue({ ...mockEstimate, total: 600 });

            await EstimatingService.createEstimateFromItems('user-1', { name: 'Bulk Est', items });

            expect(prisma.estimate.create).toHaveBeenCalled();
            expect(prisma.estimateLine.create).toHaveBeenCalledTimes(2);

            // Verify totals update
            // Item 1: 500
            // Item 2: 100
            // Total: 600
            expect(prisma.estimate.update).toHaveBeenCalledWith({
                where: { id: 'est-bulk' },
                data: { subtotal: 600, total: 600 }
            });
        });
    });
});
