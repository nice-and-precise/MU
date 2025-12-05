import { prisma } from '@/lib/prisma';

export const ObstacleService = {
    getProjectObstacles: async (projectId: string) => {
        return await prisma.obstacle.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
        });
    },

    createObstacle: async (data: any) => {
        return await prisma.obstacle.create({
            data: {
                projectId: data.projectId,
                name: data.name,
                type: data.type,
                startX: parseFloat(data.startX),
                startY: parseFloat(data.startY),
                startZ: parseFloat(data.startZ),
                endX: data.endX ? parseFloat(data.endX) : null,
                endY: data.endY ? parseFloat(data.endY) : null,
                endZ: data.endZ ? parseFloat(data.endZ) : null,
                diameter: data.diameter ? parseFloat(data.diameter) : null,
                safetyBuffer: data.safetyBuffer ? parseFloat(data.safetyBuffer) : 2.0,
                notes: data.notes,
            },
        });
    },

    deleteObstacle: async (id: string) => {
        return await prisma.obstacle.delete({
            where: { id },
        });
    }
};
