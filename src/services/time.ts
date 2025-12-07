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
    },

    getWeeklyEstGrossPay: async (employeeId: string) => {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const day = start.getDay() || 7; // Get current day number, converting Sun(0) to 7
        if (day !== 1) start.setHours(-24 * (day - 1)); // Set to Monday of this week

        const entries = await prisma.timeEntry.findMany({
            where: {
                employeeId,
                startTime: { gte: start }
            },
            include: { employee: true }
        });

        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            select: { hourlyRate: true, overtimeRule: true, defaultOvertimeMultiplier: true }
        });

        if (!employee || !employee.hourlyRate) return 0;

        let totalHours = 0;
        let regularHours = 0;
        let overtimeHours = 0;

        const now = new Date();
        entries.forEach(e => {
            const s = new Date(e.startTime).getTime();
            const end = e.endTime ? new Date(e.endTime).getTime() : now.getTime();
            const hrs = (end - s) / (1000 * 60 * 60);
            totalHours += hrs;
        });

        const threshold = 40;

        if (totalHours > threshold) {
            regularHours = threshold;
            overtimeHours = totalHours - threshold;
        } else {
            regularHours = totalHours;
        }

        const otMult = employee.defaultOvertimeMultiplier || 1.5;
        const gross = (regularHours * employee.hourlyRate) + (overtimeHours * employee.hourlyRate * otMult);

        return Math.round(gross * 100) / 100;
    }
};
