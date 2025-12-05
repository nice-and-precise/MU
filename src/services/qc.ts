import { prisma } from '@/lib/prisma';
import { CreatePunchItemSchema, UpdatePunchItemSchema, CreatePhotoSchema, DeletePhotoSchema } from '@/schemas/qc';
import { z } from 'zod';

type CreatePhotoInput = z.infer<typeof CreatePhotoSchema>;

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
                title: data.title,
                description: data.description,
                priority: data.priority,
                status: data.status,
                assigneeId: data.assigneeId,
                completedAt: data.completedAt,
            }
        });
    },

    deletePunchItem: async (id: string) => {
        return await prisma.punchItem.delete({
            where: { id }
        });
    },

    getProjectPhotos: async (projectId: string) => {
        return await prisma.photo.findMany({
            where: { projectId },
            include: { uploadedBy: true },
            orderBy: { createdAt: 'desc' }
        });
    },

    createPhoto: async (data: CreatePhotoInput, userId: string) => {
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
    },

    deletePhoto: async (id: string) => {
        return await prisma.photo.delete({
            where: { id }
        });
    }
};
