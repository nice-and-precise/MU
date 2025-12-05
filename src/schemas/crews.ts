import { z } from 'zod';

export const GetCrewsSchema = z.object({}).optional(); // No input needed usually

export const CreateCrewSchema = z.object({
    name: z.string().min(1, "Name is required"),
    foremanId: z.string().min(1, "Foreman is required"),
    memberIds: z.array(z.string()).optional()
});

export const UpdateCrewSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required").optional(),
    foremanId: z.string().min(1, "Foreman is required").optional(),
    memberIds: z.array(z.string()).optional()
});

export const DeleteCrewSchema = z.object({
    id: z.string()
});

export const DispatchCrewSchema = z.object({
    crew: z.array(z.object({
        id: z.string(),
        role: z.string()
    })),
    assets: z.array(z.string()),
    projectId: z.string()
});
