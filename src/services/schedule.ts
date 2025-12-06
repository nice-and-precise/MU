import { prisma } from '@/lib/prisma';
import { ConflictService } from '@/services/conflicts';
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
                        members: {
                            include: {
                                employee: true
                            }
                        }
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
        // If it's a Crew Shift, we need to check ALL members
        let crewMemberIds: string[] = [];
        if (data.crewId) {
            const members = await prisma.crewMember.findMany({
                where: {
                    crewId: data.crewId,
                    endDate: null // Active members only
                }
            });
            crewMemberIds = members.map(m => m.employeeId);
        }

        // Check conflicts first unless forced
        if (!data.force) {
            const conflicts = await ConflictService.checkConflicts({
                startTime: data.startTime,
                endTime: data.endTime,
                crewId: data.crewId,
                employeeId: data.employeeId,
                employeeIds: crewMemberIds, // Batch check
                assetIds: data.assetIds
            });

            if (conflicts.length > 0) {
                return { conflicts };
            }
        }

        // Create the Master Shift (Crew or Individual)
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

        // If Crew Shift, create Individual Shifts and TimeCards
        if (data.crewId && crewMemberIds.length > 0) {
            // Prepare TimeCard data (Weekly)
            const startOfPeriod = new Date(data.startTime);
            startOfPeriod.setHours(0, 0, 0, 0);
            const day = startOfPeriod.getDay(); // 0 is Sunday
            const diff = startOfPeriod.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
            startOfPeriod.setDate(diff);

            const endOfPeriod = new Date(startOfPeriod);
            endOfPeriod.setDate(startOfPeriod.getDate() + 6);
            endOfPeriod.setHours(23, 59, 59, 999);

            for (const empId of crewMemberIds) {
                // 1. Create Individual Shift
                await prisma.shift.create({
                    data: {
                        projectId: data.projectId,
                        employeeId: empId,
                        startTime: data.startTime,
                        endTime: data.endTime,
                        notes: `Crew Dispatch: ${data.notes || ''}`,
                        status: 'SCHEDULED'
                    }
                });

                // 2. Ensure TimeCard stub logic
                const existingTimeCard = await prisma.timeCard.findFirst({
                    where: {
                        employeeId: empId,
                        periodStart: {
                            gte: startOfPeriod,
                            lte: endOfPeriod
                        }
                    }
                });

                if (!existingTimeCard) {
                    await prisma.timeCard.create({
                        data: {
                            employeeId: empId,
                            periodStart: startOfPeriod,
                            periodEnd: endOfPeriod,
                            status: "DRAFT",
                            projectId: data.projectId // Associate with the project
                        }
                    });
                }
            }
        }

        return { shift };
    },

    updateShift: async (id: string, data: Partial<z.infer<typeof UpdateShiftSchema>>) => {
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
