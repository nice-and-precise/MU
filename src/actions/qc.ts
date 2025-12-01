'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// --- Punch List ---

export async function createPunchItem(data: {
    projectId: string;
    title: string;
    description?: string;
    priority: string;
    assigneeId?: string;
    dueDate?: Date
}) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const item = await prisma.punchItem.create({
            data: {
                projectId: data.projectId,
                title: data.title,
                description: data.description,
                priority: data.priority,
                assigneeId: data.assigneeId,
                dueDate: data.dueDate,
            }
        });
        revalidatePath(`/dashboard/projects/${data.projectId}/qc`);
        return { success: true, data: item };
    } catch (error) {
        console.error('Failed to create punch item:', error);
        return { success: false, error: 'Failed to create punch item' };
    }
}

export async function updatePunchItem(id: string, data: {
    status?: string;
    assigneeId?: string;
    completedAt?: Date
}) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const item = await prisma.punchItem.update({
            where: { id },
            data: {
                status: data.status,
                assigneeId: data.assigneeId,
                completedAt: data.completedAt,
            }
        });
        revalidatePath(`/dashboard/projects/${item.projectId}/qc`);
        return { success: true, data: item };
    } catch (error) {
        console.error('Failed to update punch item:', error);
        return { success: false, error: 'Failed to update punch item' };
    }
}

export async function getPunchList(projectId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return [];
    return await prisma.punchItem.findMany({
        where: { projectId },
        include: { assignee: true },
        orderBy: { createdAt: 'desc' }
    });
}

// --- Photos ---

export async function getProjectPhotos(projectId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return [];
    return await prisma.photo.findMany({
        where: { projectId },
        include: { uploadedBy: true },
        orderBy: { createdAt: 'desc' }
    });
}
