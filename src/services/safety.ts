import { prisma } from '@/lib/prisma';
import { CreateSafetyMeetingSchema, CreateJSASchema, CreateInspectionSchema } from '@/schemas/safety';
import { z } from 'zod';

export const SafetyService = {
    getSafetyMeetings: async (projectId: string) => {
        return await prisma.safetyMeeting.findMany({
            where: { projectId },
            orderBy: { date: 'desc' }
        });
    },

    createSafetyMeeting: async (data: z.infer<typeof CreateSafetyMeetingSchema>) => {
        return await prisma.safetyMeeting.create({
            data: {
                projectId: data.projectId,
                date: data.date,
                topic: data.topic,
                attendees: data.attendees,
                notes: data.notes,
            }
        });
    },

    getJSAs: async (projectId: string) => {
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
    },

    createJSA: async (data: z.infer<typeof CreateJSASchema>) => {
        return await prisma.jSA.create({
            data: {
                projectId: data.projectId,
                date: data.date,
                taskDescription: data.taskDescription,
                hazards: JSON.stringify(data.hazards),
                controls: JSON.stringify(data.controls),
                signatures: JSON.stringify(data.signatures),
            }
        });
    },

    getInspections: async (projectId: string) => {
        const inspections = await prisma.inspection.findMany({
            where: { projectId },
            include: { asset: true },
            orderBy: { createdAt: 'desc' }
        });
        return inspections.map(insp => ({
            ...insp,
            items: JSON.parse(insp.items),
        }));
    },

    createInspection: async (data: z.infer<typeof CreateInspectionSchema>) => {
        return await prisma.inspection.create({
            data: {
                projectId: data.projectId,
                assetId: data.assetId,
                createdAt: data.date, // Map date to createdAt
                type: data.type,
                items: JSON.stringify(data.items),
                passed: data.passed,
                notes: data.notes,
            }
        });
    }
};
