import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReportingService } from '@/services/reporting';
import { prisma } from '@/lib/prisma';
import { calculateBorePath, generateDXF } from '@/lib/drilling/math/survey';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        bore: {
            findUnique: vi.fn(),
        }
    }
}));

// Mock math lib
vi.mock('@/lib/drilling/math/survey', () => ({
    calculateBorePath: vi.fn(),
    generateDXF: vi.fn(),
}));

describe('ReportingService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('generateAsBuilt', () => {
        it('should generate As-Built DXF successfully', async () => {
            const boreId = 'bore-1';
            const mockBore = {
                id: boreId,
                name: 'Test Bore',
                project: {
                    dailyReports: [
                        {
                            id: 'report-1',
                            status: 'APPROVED',
                            reportDate: new Date(),
                            status: 'APPROVED',
                            reportDate: new Date(),
                            productionEntries: [
                                {
                                    quantity: 10,
                                    description: 'Drilling, Pitch: 2, Az: 90' // Description key for parsing
                                }
                            ]
                        }
                    ]
                }
            };

            (prisma.bore.findUnique as any).mockResolvedValue(mockBore);
            (calculateBorePath as any).mockReturnValue([{ x: 0, y: 0, z: 0 }, { x: 10, y: 0, z: 0 }]);
            (generateDXF as any).mockReturnValue('DXF CONTENT');

            const result = await ReportingService.generateAsBuilt(boreId);

            expect(prisma.bore.findUnique).toHaveBeenCalledWith({
                where: { id: boreId },
                include: expect.any(Object)
            });
            expect(calculateBorePath).toHaveBeenCalled();
            expect(generateDXF).toHaveBeenCalled();
            expect(result).toEqual({
                filename: 'Test_Bore_AsBuilt.dxf',
                content: 'DXF CONTENT'
            });
        });

        it('should throw error if bore not found', async () => {
            (prisma.bore.findUnique as any).mockResolvedValue(null);

            await expect(ReportingService.generateAsBuilt('invalid-id'))
                .rejects.toThrow('Bore not found');
        });

        it('should throw error if insufficient survey data', async () => {
            const mockBore = {
                id: 'bore-1',
                name: 'Test Bore',
                project: {
                    dailyReports: [] // No reports
                }
            };
            (prisma.bore.findUnique as any).mockResolvedValue(mockBore);

            await expect(ReportingService.generateAsBuilt('bore-1'))
                .rejects.toThrow('Insufficient survey data');
        });
    });
});
