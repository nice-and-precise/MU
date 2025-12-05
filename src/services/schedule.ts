import { prisma } from '@/lib/prisma';
import { checkConflicts } from '@/actions/conflicts'; // Keeping logic here for now, or move to services/conflicts later
import { CreateShiftSchema, UpdateShiftSchema } from '@/schemas/schedule';
import { z } from 'zod';

export const ScheduleService = {
    getShifts: async (start: Date, end: Date) => {
        return await prisma.shift.findMany({
            where: {
                startTime: {
                    gte: start,
                    lte: end
                }
            },
            include: {
                project: true,
                crew: {
                    include: {
                        members: true
                    }
                },
                employee: true,
                assets: {
                    include: {
                        asset: true
                    }
                }
            },
            orderBy: { startTime: 'asc' }
        });
    },

    createShift: async (data: z.infer<typeof CreateShiftSchema>) => {
        // Check conflicts first unless forced
        if (!data.force) {
            const conflicts = await checkConflicts({
                startTime: data.startTime,
                endTime: data.endTime,
                crewId: data.crewId,
                employeeId: data.employeeId,
                assetIds: data.assetIds
            });

            if (conflicts.length > 0) {
                return { conflicts };
            }
        }

        const shift = await prisma.shift.create({
            data: {
                projectId: data.projectId,
                crewId: data.crewId,
                employeeId: data.employeeId,
                startTime: data.startTime,
                endTime: data.endTime,
                notes: data.notes,
                assets: {
                    create: data.assetIds?.map(id => ({
                        assetId: id
                    })) || []
                }
            }
        });

        return { shift };
    },

    updateShift: async (id: string, data: Partial<z.infer<typeof UpdateShiftSchema>>) => {
        // Conflict check on update omitted in original code logic?
        // Original updateShift didn't check conflicts.
        return await prisma.shift.update({
            where: { id },
            data: {
                startTime: data.startTime,
                endTime: data.endTime,
                notes: data.notes,
                status: data.status,
            }
        });
    },

    deleteShift: async (id: string) => {
        return await prisma.shift.delete({
            where: { id }
        });
    }
};
