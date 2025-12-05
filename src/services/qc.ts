import { prisma } from '@/lib/prisma';
import { CreatePunchItemSchema, UpdatePunchItemSchema, CreatePhotoSchema } from '@/schemas/qc';
import { z } from 'zod';

export const QCService = {
    getPunchList: async (projectId: string) => {
        return await prisma.punchItem.findMany({
            where: { projectId },
            include: { assignee: true },
            orderBy: { createdAt: 'desc' }
        });
    },

    createPunchItem: async (data: z.infer<typeof CreatePunchItemSchema>) => {
        return await prisma.punchItem.create({
            data: {
                projectId: data.projectId,
                title: data.title,
                description: data.description,
                priority: data.priority,
                assigneeId: data.assigneeId,
                dueDate: data.dueDate,
            }
        });
    },

    updatePunchItem: async (id: string, data: Partial<z.infer<typeof UpdatePunchItemSchema>>) => {
        return await prisma.punchItem.update({
            where: { id },
            data: {
                status: data.status,
                assigneeId: data.assigneeId,
                completedAt: data.completedAt,
            }
        });
    },

    getProjectPhotos: async (projectId: string) => {
        return await prisma.photo.findMany({
            where: { projectId },
            include: { uploadedBy: true },
            orderBy: { createdAt: 'desc' }
        });
    },

    createPhoto: async (data: z.infer<typeof CreatePhotoSchema>, userId: string) => {
        return await prisma.photo.create({
            data: {
                projectId: data.projectId,
                url: data.url,
                thumbnailUrl: data.thumbnailUrl,
                filename: data.url.split('/').pop() || 'image.jpg',
                size: 0,
                mimeType: 'image/jpeg',
                uploadedById: userId
            }
        });
    }
};
