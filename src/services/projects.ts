import { prisma } from "@/lib/prisma";

export const ProjectService = {
    getActiveProjects: async () => {
        return await prisma.project.findMany({
            where: { status: { in: ['PLANNING', 'IN_PROGRESS'] } },
            orderBy: { updatedAt: 'desc' }
        });
    },

    getProjects: async (statuses?: string[]) => {
        return await prisma.project.findMany({
            where: statuses ? { status: { in: statuses } } : undefined,
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
    },

    getProjectTimeline: async (id: string) => {
        const project = await prisma.project.findUnique({
            where: { id },
            select: {
                id: true,
                createdAt: true,
                name: true,
                status: true,
            }
        });

        if (!project) return null;

        const [estimates, bores, punchItems] = await Promise.all([
            prisma.estimate.findMany({
                where: { projectId: id }, // Assuming estimates are linked to project
                select: { id: true, name: true, createdAt: true, status: true, total: true }
            }),
            prisma.bore.findMany({
                where: { projectId: id },
                select: { id: true, name: true, status: true, createdAt: true, updatedAt: true }
            }),
            prisma.punchItem.findMany({
                where: { projectId: id },
                select: { id: true, title: true, status: true, createdAt: true, completedAt: true }
            })
        ]);

        return {
            project,
            estimates,
            bores,
            punchItems
        };
    },

    getLaborStats: async (projectId: string) => {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { budget: true }
        });

        const entries = await prisma.timeEntry.findMany({
            where: { projectId },
            include: { employee: { select: { hourlyRate: true } } }
        });

        let actualCost = 0;
        const now = new Date();

        entries.forEach(e => {
            const start = e.startTime.getTime();
            const end = e.endTime ? e.endTime.getTime() : now.getTime();
            const hours = (end - start) / (1000 * 60 * 60);
            const rate = e.employee.hourlyRate || 0;
            actualCost += hours * rate;
        });

        return {
            actualLaborCost: Math.round(actualCost * 100) / 100,
            projectBudget: project?.budget || 0,
            // Simple heuristic: 40% of budget is typically labor in this industry if not specified
            estimatedLaborBudget: (project?.budget || 0) * 0.4
        };
    }
};
