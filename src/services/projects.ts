import { prisma } from "@/lib/prisma";

export async function getActiveProjectsService() {
    return await prisma.project.findMany({
        where: { status: { in: ['PLANNING', 'IN_PROGRESS'] } },
        orderBy: { updatedAt: 'desc' }
    });
}
