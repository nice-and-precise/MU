import { z } from 'zod';

export const CreatePunchItemSchema = z.object({
    projectId: z.string().min(1, "Project ID is required"),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).or(z.string()),
    assigneeId: z.string().optional(),
    dueDate: z.union([z.string(), z.date()]).transform(val => new Date(val)).optional()
});

export const UpdatePunchItemSchema = z.object({
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).or(z.string()).optional(),
    status: z.string().optional(),
    assigneeId: z.string().optional(),
    completedAt: z.union([z.string(), z.date()]).transform(val => new Date(val)).optional()
});

export const DeletePunchItemSchema = z.object({
    id: z.string(),
    projectId: z.string() // Required for revalidation
});

export const GetProjectPhotosSchema = z.string(); // projectId

export const CreatePhotoSchema = z.object({
    projectId: z.string(),
    url: z.string().url(),
    thumbnailUrl: z.string().url().optional()
});

export const DeletePhotoSchema = z.object({
    id: z.string(),
    projectId: z.string()
});
