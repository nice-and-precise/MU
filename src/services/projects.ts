import { prisma } from "@/lib/prisma";

export const ProjectService = {
    getActiveProjects: async () => {
        return await prisma.project.findMany({
            where: { status: { in: ['PLANNING', 'IN_PROGRESS'] } },
            orderBy: { updatedAt: 'desc' }
        });
    },

    getProjects: async () => {
        return await prisma.project.findMany({
            orderBy: { updatedAt: "desc" },
            include: {
                _count: {
                    select: { bores: true, dailyReports: true },
                },
            },
        });
    },

    getProject: async (id: string) => {
        return await prisma.project.findUnique({
            where: { id },
            include: {
                bores: {
                    select: {
                        id: true,
                        name: true,
                        totalLength: true,
                        productMaterial: true,
                        status: true,
                    }
                },
                dailyReports: {
                    orderBy: { reportDate: "desc" },
                    take: 5,
                    select: {
                        id: true,
                        reportDate: true,
                        notes: true,
                        status: true,
                    }
                },
                tickets811: {
                    select: {
                        id: true,
                        ticketNumber: true,
                        expirationDate: true,
                        status: true,
                    }
                },
                stationProgress: {
                    orderBy: { date: 'desc' },
                },
            },
        });
    }
};
