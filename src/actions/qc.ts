'use server';

import { revalidatePath } from 'next/cache';
import { authenticatedAction } from '@/lib/safe-action';
import { QCService } from '@/services/qc';
import {
    CreatePunchItemSchema,
    UpdatePunchItemSchema,
    DeletePunchItemSchema,
    GetProjectPhotosSchema,
    CreatePhotoSchema,
    DeletePhotoSchema
} from '@/schemas/qc';

// --- Punch List ---

export const createPunchItem = authenticatedAction(
    CreatePunchItemSchema,
    async (data) => {
        const item = await QCService.createPunchItem(data);
        revalidatePath(`/dashboard/projects/${data.projectId}/qc`);
        return item;
    }
);

export const updatePunchItem = authenticatedAction(
    UpdatePunchItemSchema,
    async ({ id, ...data }) => {
        const item = await QCService.updatePunchItem(id, data);
        // We need projectId for revalidation. 
        // Ideally the service returns the full item including projectId.
        // Prisma update returns the object.
        revalidatePath(`/dashboard/projects/${item.projectId}/qc`);
        return item;
    }
);

export const deletePunchItem = authenticatedAction(
    DeletePunchItemSchema,
    async ({ id, projectId }) => {
        await QCService.deletePunchItem(id);
        revalidatePath(`/dashboard/projects/${projectId}/qc`);
        return { success: true };
    }
);

export const getPunchList = authenticatedAction(
    GetProjectPhotosSchema, // Reusing schema as it is just projectId string
    async (projectId) => {
        return await QCService.getPunchList(projectId);
    }
);

// --- Photos ---

export const getProjectPhotos = authenticatedAction(
    GetProjectPhotosSchema,
    async (projectId) => {
        return await QCService.getProjectPhotos(projectId);
    }
);

export const createPhoto = authenticatedAction(
    CreatePhotoSchema,
    async (data, userId) => {
        const photo = await QCService.createPhoto(data, userId);
        revalidatePath(`/dashboard/projects/${data.projectId}/qc`);
        return photo;
    }
);

export const deletePhoto = authenticatedAction(
    DeletePhotoSchema,
    async ({ id, projectId }) => {
        await QCService.deletePhoto(id);
        revalidatePath(`/dashboard/projects/${projectId}/qc`);
        return { success: true };
    }
);

