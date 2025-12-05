'use server';

import { revalidatePath } from 'next/cache';
import { authenticatedAction } from '@/lib/safe-action';
import { z } from 'zod';
import { GeotechService } from '@/services/geotech';
import { GeotechReportSchema, SoilLayerSchema, ImportFromMNKWISchema } from '@/schemas/geotech';
import { prisma } from '@/lib/prisma';

export const createGeotechReport = authenticatedAction(
    GeotechReportSchema,
    async (data) => {
        const report = await GeotechService.createGeotechReport(data);
        revalidatePath(`/dashboard/projects/${data.projectId}`);
        return report;
    }
);

export const addSoilLayer = authenticatedAction(
    SoilLayerSchema,
    async (data) => {
        const layer = await GeotechService.addSoilLayer(data);
        // Fetch the report to get the project ID for revalidation
        const report = await prisma.geotechReport.findUnique({
            where: { id: data.geotechReportId },
            select: { projectId: true },
        });

        if (report) {
            revalidatePath(`/dashboard/projects/${report.projectId}`);
        }
        return layer;
    }
);

export const getProjectGeotech = authenticatedAction(
    z.string(), // projectId
    async (projectId) => {
        return await GeotechService.getProjectGeotech(projectId);
    }
);

export const deleteGeotechReport = authenticatedAction(
    z.object({
        id: z.string(),
        projectId: z.string() // Passed for revalidation
    }),
    async ({ id, projectId }) => {
        await GeotechService.deleteGeotechReport(id);
        revalidatePath(`/dashboard/projects/${projectId}`);
        return { success: true };
    }
);

export const importFromMNCWI = authenticatedAction(
    ImportFromMNKWISchema,
    async ({ projectId, lat, lon }) => {
        const result = await GeotechService.importFromMNCWI(projectId, lat, lon);
        revalidatePath(`/dashboard/projects/${projectId}`);
        return result;
    }
);
