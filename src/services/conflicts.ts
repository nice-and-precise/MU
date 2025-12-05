import { prisma } from '@/lib/prisma';

export interface ConflictResult {
    type: 'CREW' | 'EMPLOYEE' | 'ASSET';
    id: string;
    name: string;
    message: string;
    conflictingShiftId: string;
}

export const ConflictService = {
    checkConflicts: async (params: any): Promise<ConflictResult[]> => {
        const conflicts: ConflictResult[] = [];
        const { startTime, endTime, crewId, employeeId, assetIds, excludeShiftId } = params;

        // 1. Check Crew Conflicts
        if (crewId) {
            const conflictingShifts = await prisma.shift.findMany({
                where: {
                    crewId,
                    id: { not: excludeShiftId },
                    OR: [
                        { startTime: { lte: endTime }, endTime: { gte: startTime } }
                    ]
                },
                include: { crew: true }
            });

            for (const shift of conflictingShifts) {
                conflicts.push({
                    type: 'CREW',
                    id: crewId,
                    name: shift.crew?.name || 'Unknown Crew',
                    message: `Crew is already scheduled from ${shift.startTime.toLocaleString()} to ${shift.endTime.toLocaleString()}`,
                    conflictingShiftId: shift.id
                });
            }
        }

        // 2. Check Employee Conflicts
        if (employeeId) {
            const conflictingShifts = await prisma.shift.findMany({
                where: {
                    employeeId,
                    id: { not: excludeShiftId },
                    OR: [
                        { startTime: { lte: endTime }, endTime: { gte: startTime } }
                    ]
                },
                include: { employee: true }
            });

            for (const shift of conflictingShifts) {
                conflicts.push({
                    type: 'EMPLOYEE',
                    id: employeeId,
                    name: shift.employee ? `${shift.employee.firstName} ${shift.employee.lastName}` : 'Unknown Employee',
                    message: `Employee is already scheduled from ${shift.startTime.toLocaleString()} to ${shift.endTime.toLocaleString()}`,
                    conflictingShiftId: shift.id
                });
            }
        }

        // 3. Check Asset Conflicts
        if (assetIds && assetIds.length > 0) {
            const conflictingAssets = await prisma.shiftAsset.findMany({
                where: {
                    assetId: { in: assetIds },
                    shift: {
                        id: { not: excludeShiftId },
                        OR: [
                            { startTime: { lte: endTime }, endTime: { gte: startTime } }
                        ]
                    }
                },
                include: {
                    asset: true,
                    shift: true
                }
            });

            for (const sa of conflictingAssets) {
                conflicts.push({
                    type: 'ASSET',
                    id: sa.assetId,
                    name: sa.asset.name,
                    message: `Asset ${sa.asset.name} is already scheduled on shift ${sa.shift.id}`,
                    conflictingShiftId: sa.shiftId
                });
            }
        }

        return conflicts;
    }
};
