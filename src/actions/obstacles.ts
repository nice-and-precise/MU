'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getProjectObstacles(projectId: string) {
    try {
        const obstacles = await prisma.obstacle.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, data: obstacles };
    } catch (error) {
        console.error('Error fetching obstacles:', error);
        return { success: false, error: 'Failed to fetch obstacles' };
    }
}

export async function createObstacle(data: any) {
    try {
        const obstacle = await prisma.obstacle.create({
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
        revalidatePath(`/dashboard/projects/${data.projectId}`);
        return { success: true, data: obstacle };
    } catch (error) {
        console.error('Error creating obstacle:', error);
        return { success: false, error: 'Failed to create obstacle' };
    }
}

export async function deleteObstacle(id: string) {
    try {
        await prisma.obstacle.delete({
            where: { id },
        });
        return { success: true };
    } catch (error) {
        console.error('Error deleting obstacle:', error);
        return { success: false, error: 'Failed to delete obstacle' };
    }
}
