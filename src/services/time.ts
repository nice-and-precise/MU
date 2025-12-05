import { prisma } from '@/lib/prisma';
import { ClockInSchema, ClockOutSchema } from '@/schemas/time';
import { z } from 'zod';

export const TimeService = {
    clockIn: async (data: z.infer<typeof ClockInSchema>) => {
        // Check if already clocked in
        const activeEntry = await prisma.timeEntry.findFirst({
            where: {
                employeeId: data.employeeId,
                endTime: null
            }
        });

        if (activeEntry) {
            throw new Error("Already clocked in");
        }

        return await prisma.timeEntry.create({
            data: {
                employeeId: data.employeeId,
                projectId: data.projectId,
                startTime: new Date(),
                startLat: data.lat,
                startLong: data.long,
                type: data.type || "WORK",
                status: "PENDING"
            }
        });
    },

    clockOut: async (data: z.infer<typeof ClockOutSchema>) => {
        const activeEntry = await prisma.timeEntry.findFirst({
            where: {
                employeeId: data.employeeId,
                endTime: null
            }
        });

        if (!activeEntry) {
            throw new Error("Not clocked in");
        }

        return await prisma.timeEntry.update({
            where: { id: activeEntry.id },
            data: {
                endTime: new Date(),
                endLat: data.lat,
                endLong: data.long,
            }
        });
    },

    getClockStatus: async (employeeId: string) => {
        return await prisma.timeEntry.findFirst({
            where: {
                employeeId,
                endTime: null
            }
        });
    }
};
