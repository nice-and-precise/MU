import { z } from 'zod';

export const GetSafetyMeetingsSchema = z.string(); // projectId
export const GetJSAsSchema = z.string(); // projectId
export const GetInspectionsSchema = z.string(); // projectId

export const CreateSafetyMeetingSchema = z.object({
    projectId: z.string().min(1, "Project ID is required"),
    date: z.union([z.string(), z.date()]).transform(val => new Date(val)),
    topic: z.string().min(1, "Topic is required"),
    attendees: z.array(z.string()),
    notes: z.string().optional()
});

export const CreateJSASchema = z.object({
    projectId: z.string().min(1, "Project ID is required"),
    date: z.union([z.string(), z.date()]).transform(val => new Date(val)),
    taskDescription: z.string().min(1, "Task Description is required"),
    hazards: z.array(z.any()), // JSON structure, maybe can be more specific later
    controls: z.array(z.any()),
    signatures: z.array(z.any())
});

export const CreateInspectionSchema = z.object({
    projectId: z.string().min(1, "Project ID is required"),
    assetId: z.string().optional(),
    date: z.union([z.string(), z.date()]).transform(val => new Date(val)),
    type: z.string().min(1, "Type is required"),
    items: z.array(z.any()),
    passed: z.boolean(),
    notes: z.string().optional()
});
