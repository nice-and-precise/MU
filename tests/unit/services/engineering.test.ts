import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EngineeringService } from '@/services/engineering';
import { prisma } from '@/lib/prisma';
import { calculatePullbackForce } from '@/lib/drilling/math/loads';
import { analyzeFracOutRisk } from '@/lib/drilling/math/hydraulics';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        bore: {
            findUnique: vi.fn(),
        },
        borePlan: {
            upsert: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        fluidPlan: {
            upsert: vi.fn(),
        }
    }
}));

// Mock math libs
vi.mock('@/lib/drilling/math/loads', () => ({
    calculatePullbackForce: vi.fn(),
    calculateDetailedPullback: vi.fn(),
}));

vi.mock('@/lib/drilling/math/hydraulics', () => ({
    analyzeFracOutRisk: vi.fn(),
}));

vi.mock('@/lib/drilling/utils', () => ({
    convertBoreToTrajectory: vi.fn(),
}));

describe('EngineeringService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('upsertBorePlan', () => {
        it('should upsert bore plan with simplified calculation', async () => {
            const input = {
                boreId: 'bore-1',
                totalLength: 1000,
                pipeDiameter: 12,
                pipeMaterial: 'HDPE',
                safetyFactor: 1.5,
            };

            const mockBore = {
                id: 'bore-1',
                projectId: 'proj-1',
                project: {
                    geotechReports: []
                },
                rodPasses: []
            };

            (prisma.bore.findUnique as any).mockResolvedValue(mockBore);
            (calculatePullbackForce as any).mockReturnValue(50000);
            (prisma.borePlan.upsert as any).mockResolvedValue({ ...input, pullbackForce: 50000 });

            const result = await EngineeringService.upsertBorePlan(input);

            expect(calculatePullbackForce).toHaveBeenCalled();
            expect(prisma.borePlan.upsert).toHaveBeenCalledWith({
                where: { boreId: 'bore-1' },
                update: expect.objectContaining({ pullbackForce: 50000 }),
                create: expect.objectContaining({ pullbackForce: 50000 }),
            });
            expect(result.pullbackForce).toBe(50000);
        });
    });

    describe('upsertFluidPlan', () => {
        it('should upsert fluid plan and calculate frac-out risk', async () => {
            const input = {
                borePlanId: 'plan-1',
                soilType: 'Clay',
                pumpRate: 50,
            };

            const mockBorePlan = {
                id: 'plan-1',
                boreId: 'bore-1',
                totalLength: 1000,
                pipeDiameter: 12,
                bore: {
                    id: 'bore-1',
                    project: {
                        geotechReports: []
                    }
                }
            };

            (prisma.borePlan.findUnique as any).mockResolvedValue(mockBorePlan);
            (prisma.bore.findUnique as any).mockResolvedValue(mockBorePlan.bore); // For getProjectSoilLayers call inside upsertFluidPlan? No, it calls getProjectSoilLayers which calls prisma.bore.findUnique
            (analyzeFracOutRisk as any).mockReturnValue({ riskLevel: 'Medium' });
            (prisma.fluidPlan.upsert as any).mockResolvedValue(input);

            await EngineeringService.upsertFluidPlan(input);

            expect(analyzeFracOutRisk).toHaveBeenCalled();
            expect(prisma.fluidPlan.upsert).toHaveBeenCalled();
            expect(prisma.borePlan.update).toHaveBeenCalledWith({
                where: { id: 'plan-1' },
                data: { fracOutRisk: 'Medium' }
            });
        });
    });
});
