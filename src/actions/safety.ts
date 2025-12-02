'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// --- Safety Meetings ---

export async function createSafetyMeeting(data: {
    projectId: string;
    date: Date;
    topic: string;
    attendees: string[];
    notes?: string
}) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const meeting = await prisma.safetyMeeting.create({
            data: {
                projectId: data.projectId,
                date: data.date,
                topic: data.topic,
                attendees: data.attendees,
                notes: data.notes,
            }
        });
        revalidatePath(`/dashboard/projects/${data.projectId}/safety`);
        return { success: true, data: meeting };
    } catch (error) {
        console.error('Failed to create safety meeting:', error);
        return { success: false, error: 'Failed to create safety meeting' };
    }
}

export async function getSafetyMeetings(projectId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return [];
    return await prisma.safetyMeeting.findMany({
        where: { projectId },
        orderBy: { date: 'desc' }
    });
}

// --- JSAs ---

export async function createJSA(data: {
    projectId: string;
    date: Date;
    taskDescription: string;
    hazards: any[];
    controls: any[];
    signatures: any[];
}) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const jsa = await prisma.jSA.create({
            data: {
                projectId: data.projectId,
                date: data.date,
                taskDescription: data.taskDescription,
                hazards: JSON.stringify(data.hazards),
                controls: JSON.stringify(data.controls),
                signatures: JSON.stringify(data.signatures),
            }
        });
        revalidatePath(`/dashboard/projects/${data.projectId}/safety`);
        return { success: true, data: jsa };
    } catch (error) {
        console.error('Failed to create JSA:', error);
        return { success: false, error: 'Failed to create JSA' };
    }
}

export async function getJSAs(projectId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return [];
    const jsas = await prisma.jSA.findMany({
        where: { projectId },
        orderBy: { date: 'desc' }
    });
    return jsas.map(jsa => ({
        ...jsa,
        hazards: JSON.parse(jsa.hazards),
        controls: JSON.parse(jsa.controls),
        signatures: JSON.parse(jsa.signatures),
    }));
}

// --- Inspections ---

export async function createInspection(data: {
    projectId: string;
    assetId?: string;
    date: Date;
    type: string;
    items: any[];
    passed: boolean;
    notes?: string
}) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const inspection = await prisma.inspection.create({
            data: {
                projectId: data.projectId,
                assetId: data.assetId,
                // date: data.date, // Inspection uses createdAt
                type: data.type,
                items: JSON.stringify(data.items),
                passed: data.passed,
                notes: data.notes,
            }
        });
        revalidatePath(`/dashboard/projects/${data.projectId}/safety`);
        return { success: true, data: inspection };
    } catch (error) {
        console.error('Failed to create inspection:', error);
        return { success: false, error: 'Failed to create inspection' };
    }
}

export async function getInspections(projectId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return [];
    const inspections = await prisma.inspection.findMany({
        where: { projectId },
        include: { asset: true },
        orderBy: { createdAt: 'desc' }
    });
    return inspections.map(insp => ({
        ...insp,
        items: JSON.parse(insp.items),
    }));
}
