import { prisma } from '@/lib/prisma';
import { AddProgressInput } from '@/schemas/progress';

export class ProgressService {
    static async getProjectProgress(projectId: string) {
        return await prisma.stationProgress.findMany({
            where: { projectId },
            orderBy: { date: 'desc' },
        });
    }

    static async addProgress(data: AddProgressInput) {
        return await prisma.stationProgress.create({
            data: {
                project: { connect: { id: data.projectId } },
                startStation: data.startStation,
                endStation: data.endStation,
                status: data.status,
                date: data.date,
            },
        });
    }
}
