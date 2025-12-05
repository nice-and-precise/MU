import { prisma } from '@/lib/prisma';

export const LaborService = {
    createTimeCard: async (data: any) => {
        // Calculate period start (Monday) and end (Sunday)
        const d = new Date(data.date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const periodStart = new Date(d.setDate(diff));
        const periodEnd = new Date(d.setDate(diff + 6));

        return await prisma.timeCard.create({
            data: {
                employeeId: data.employeeId,
                projectId: data.projectId,
                date: data.date,
                hours: data.hours,
                code: data.code,
                notes: data.notes,
                periodStart,
                periodEnd,
            }
        });
    },

    getTimeCards: async (projectId: string) => {
        return await prisma.timeCard.findMany({
            where: { projectId },
            include: { employee: true },
            orderBy: { date: 'desc' }
        });
    }
};
