'use server';

import { prisma } from '@/lib/prisma';
import { StationProgress, Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getProjectProgress(projectId: string) {
    try {
        const progress = await prisma.stationProgress.findMany({
            where: { projectId },
            orderBy: { date: 'desc' },
        });
        return { success: true, data: progress };
    } catch (error) {
        console.error('Error fetching project progress:', error);
        return { success: false, error: 'Failed to fetch project progress' };
    }
}

export async function addProgress(data: Prisma.StationProgressCreateInput) {
    try {
        const progress = await prisma.stationProgress.create({
            data,
        });
        revalidatePath(`/dashboard/projects/${data.project.connect?.id}`);
        return { success: true, data: progress };
    } catch (error) {
        console.error('Error adding progress:', error);
        return { success: false, error: 'Failed to add progress' };
    }
}
