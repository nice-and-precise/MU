import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InventoryService } from '@/services/inventory';
import { prisma } from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        inventoryItem: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            fields: { reorderPoint: 'reorderPoint' } // Mock fields object
        },
        inventoryTransaction: {
            create: vi.fn(),
            findMany: vi.fn(),
        },
        $transaction: vi.fn((ops) => Promise.all(ops)),
    }
}));

describe('InventoryService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('updateInventory', () => {
        it('should update inventory and create transaction (RESTOCK)', async () => {
            const itemId = 'item-1';
            const input = {
                itemId,
                quantity: 10,
                type: 'RESTOCK' as const,
                projectId: 'proj-1',
                userId: 'user-1',
            };

            const mockItem = { id: itemId, quantityOnHand: 5 };
            (prisma.inventoryItem.findUnique as any).mockResolvedValue(mockItem);
            (prisma.inventoryItem.update as any).mockResolvedValue({ ...mockItem, quantityOnHand: 15 });
            (prisma.inventoryTransaction.create as any).mockResolvedValue({});

            await InventoryService.updateInventory(input);

            expect(prisma.inventoryItem.update).toHaveBeenCalledWith({
                where: { id: itemId },
                data: { quantityOnHand: 15 }
            });
            expect(prisma.inventoryTransaction.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    itemId,
                    type: 'RESTOCK',
                    quantity: 10,
                })
            });
        });

        it('should throw error if insufficient quantity (USE)', async () => {
            const itemId = 'item-1';
            const input = {
                itemId,
                quantity: 10,
                type: 'USE' as const,
                projectId: 'proj-1',
                userId: 'user-1',
            };

            const mockItem = { id: itemId, quantityOnHand: 5 }; // Only 5 on hand
            (prisma.inventoryItem.findUnique as any).mockResolvedValue(mockItem);

            await expect(InventoryService.updateInventory(input))
                .rejects.toThrow('Insufficient quantity');
        });
    });

    describe('recordTransaction', () => {
        it('should handle ADJUST transaction correctly', async () => {
            const itemId = 'item-1';
            const input = {
                itemId,
                quantity: 20, // New count
                type: 'ADJUST' as const,
                projectId: 'proj-1',
                userId: 'user-1',
            };

            const mockItem = { id: itemId, quantityOnHand: 10 }; // Old count
            (prisma.inventoryItem.findUnique as any).mockResolvedValue(mockItem);
            (prisma.inventoryItem.update as any).mockResolvedValue({ ...mockItem, quantityOnHand: 20 });

            await InventoryService.recordTransaction(input);

            expect(prisma.inventoryItem.update).toHaveBeenCalledWith({
                where: { id: itemId },
                data: { quantityOnHand: 20 }
            });

            // Transaction quantity should be diff: 20 - 10 = 10
            expect(prisma.inventoryTransaction.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    type: 'RESTOCK', // ADJUST maps to RESTOCK if positive diff
                    quantity: 10,
                })
            });
        });
    });
});
