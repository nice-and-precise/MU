'use server';

import { revalidatePath } from 'next/cache';
import { authenticatedAction } from '@/lib/safe-action';
import { SafetyService } from '@/services/safety';
import {
    CreateSafetyMeetingSchema,
    CreateJSASchema,
    CreateInspectionSchema,
    GetSafetyMeetingsSchema,
    GetJSAsSchema,
    GetInspectionsSchema
} from '@/schemas/safety';

// --- Safety Meetings ---

export const createSafetyMeeting = authenticatedAction(
    CreateSafetyMeetingSchema,
    async (data) => {
        const meeting = await SafetyService.createSafetyMeeting(data);
        revalidatePath(`/dashboard/projects/${data.projectId}/safety`);
        return meeting;
    }
);

export const getSafetyMeetings = authenticatedAction(
    GetSafetyMeetingsSchema,
    async (projectId) => {
        return await SafetyService.getSafetyMeetings(projectId);
    }
);

// --- JSAs ---

export const createJSA = authenticatedAction(
    CreateJSASchema,
    async (data) => {
        const jsa = await SafetyService.createJSA(data);
        revalidatePath(`/dashboard/projects/${data.projectId}/safety`);
        return jsa;
    }
);

export const getJSAs = authenticatedAction(
    GetJSAsSchema,
    async (projectId) => {
        return await SafetyService.getJSAs(projectId);
    }
);

// --- Inspections ---

export const createInspection = authenticatedAction(
    CreateInspectionSchema,
    async (data) => {
        const inspection = await SafetyService.createInspection(data);
        revalidatePath(`/dashboard/projects/${data.projectId}/safety`);
        return inspection;
    }
);

export const getInspections = authenticatedAction(
    GetInspectionsSchema,
    async (projectId) => {
        return await SafetyService.getInspections(projectId);
    }
);

