
'use server';
// Force rebuild

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schema for Geotech Report
const GeotechReportSchema = z.object({
    projectId: z.string(),
    title: z.string().min(1, "Title is required"),
    reportDate: z.string(), // ISO string
    engineer: z.string().optional(),
    description: z.string().optional(),
    pdfUrl: z.string().optional(),
});

// Schema for Soil Layer
const SoilLayerSchema = z.object({
    geotechReportId: z.string(),
    startDepth: z.number(),
    endDepth: z.number(),
    soilType: z.string(),
    description: z.string().optional(),
    color: z.string().optional(),
    hardness: z.number().optional(),
    phpaRequired: z.boolean().optional(),
    rockStrengthPsi: z.number().optional(),
});

export async function createGeotechReport(data: z.infer<typeof GeotechReportSchema>) {
    try {
        const validated = GeotechReportSchema.parse(data);

        const report = await prisma.geotechReport.create({
            data: {
                projectId: validated.projectId,
                title: validated.title,
                reportDate: new Date(validated.reportDate),
                engineer: validated.engineer,
                description: validated.description,
                pdfUrl: validated.pdfUrl,
            },
        });

        revalidatePath(`/dashboard/projects/${validated.projectId}`);
        return { success: true, data: report };
    } catch (error) {
        console.error('Failed to create geotech report:', error);
        return { success: false, error: 'Failed to create report' };
    }
}

export async function addSoilLayer(data: z.infer<typeof SoilLayerSchema>) {
    try {
        const validated = SoilLayerSchema.parse(data);

        const layer = await prisma.soilLayer.create({
            data: {
                geotechReportId: validated.geotechReportId,
                startDepth: validated.startDepth,
                endDepth: validated.endDepth,
                soilType: validated.soilType,
                description: validated.description,
                color: validated.color,
                hardness: validated.hardness,
                phpaRequired: validated.phpaRequired || false,
                rockStrengthPsi: validated.rockStrengthPsi,
            },
        });

        // Fetch the report to get the project ID for revalidation
        const report = await prisma.geotechReport.findUnique({
            where: { id: validated.geotechReportId },
            select: { projectId: true },
        });

        if (report) {
            revalidatePath(`/dashboard/projects/${report.projectId}`);
        }

        return { success: true, data: layer };
    } catch (error) {
        console.error('Failed to add soil layer:', error);
        return { success: false, error: 'Failed to add soil layer' };
    }
}

export async function getProjectGeotech(projectId: string) {
    try {
        const reports = await prisma.geotechReport.findMany({
            where: { projectId },
            include: {
                soilLayers: {
                    orderBy: { startDepth: 'asc' },
                },
            },
            orderBy: { reportDate: 'desc' },
        });
        return { success: true, data: reports };
    } catch (error) {
        console.error('Failed to fetch geotech reports:', error);
        return { success: false, error: 'Failed to fetch reports' };
    }
}

export async function deleteGeotechReport(id: string, projectId: string) {
    try {
        await prisma.geotechReport.delete({
            where: { id },
        });
        revalidatePath(`/dashboard/projects/${projectId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete report' };
    }
}

/**
 * Imports soil data from the Minnesota County Well Index (CWI).
 * Simulates an API call to the MGS/MnDOT ArcGIS server.
 */
export async function importFromMNCWI(projectId: string, lat: number, lon: number) {
    try {
        // 1. Create a new Geotech Report
        const report = await prisma.geotechReport.create({
            data: {
                projectId,
                title: 'MN CWI Import',
                reportDate: new Date(),
                engineer: 'Minnesota Geological Survey',
                description: `Imported from County Well Index near ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
            }
        });

        // 2. Simulate fetching layers (In a real app, we'd fetch from ArcGIS REST API)
        // Mock data representing typical MN Glacial Till
        const layers = [
            { start: 0, end: 15, type: 'Clay', desc: 'Topsoil and Yellow Clay' },
            { start: 15, end: 45, type: 'Sand', desc: 'Fine Sand, water bearing' },
            { start: 45, end: 80, type: 'Clay', desc: 'Blue Clay, stiff' },
            { start: 80, end: 120, type: 'Gravel', desc: 'Glacial Till / Cobbles' },
            { start: 120, end: 150, type: 'Rock', desc: 'Bedrock (Granite)' }
        ];

        for (const l of layers) {
            await prisma.soilLayer.create({
                data: {
                    geotechReportId: report.id,
                    startDepth: l.start,
                    endDepth: l.end,
                    soilType: l.type,
                    description: l.desc,
                    color: l.type === 'Clay' ? '#8B4513' : (l.type === 'Sand' ? '#F4A460' : '#808080'),
                    hardness: l.type === 'Rock' ? 8 : 4
                }
            });
        }

        revalidatePath(`/dashboard/projects/${projectId}`);
        return { success: true, message: 'Imported 5 layers from CWI' };

    } catch (error) {
        console.error('Failed to import CWI data:', error);
        return { success: false, error: 'Failed to import data' };
    }
}
