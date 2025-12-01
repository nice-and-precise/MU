'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { parseWitsml } from '@/lib/parsers/witsml';
import { parseCsv } from '@/lib/parsers/csv';

export async function importSurveyData(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        const projectId = formData.get('projectId') as string;

        if (!file || !projectId) {
            return { success: false, error: 'Missing file or project ID' };
        }

        const buffer = await file.arrayBuffer();
        const content = new TextDecoder().decode(buffer);
        const extension = file.name.split('.').pop()?.toLowerCase();

        let points: any[] = [];

        if (extension === 'xml' || extension === 'witsml') {
            points = await parseWitsml(content);
        } else if (extension === 'csv') {
            points = await parseCsv(content);
        } else {
            return { success: false, error: 'Unsupported file format' };
        }

        if (points.length === 0) {
            return { success: false, error: 'No valid survey points found' };
        }

        // Save to database
        // We'll create RodPass entries for each point
        // Note: This assumes each point corresponds to a rod end, which is a simplification
        // Ideally we'd have a separate Survey table, but RodPass works for now as "As-Drilled" data

        // First, verify project exists
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) return { success: false, error: 'Project not found' };

        // Transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
            // Optional: Clear existing "As-Drilled" data if this is a full replace?
            // For now, we'll just append.

            for (const p of points) {
                await tx.rodPass.create({
                    data: {
                        projectId,
                        index: Math.floor(p.md / 15), // Approx index
                        length: 15, // Standard rod
                        pitch: p.inc - 90, // Convert Inc (0=Down) to Pitch (0=Horizontal)
                        azimuth: p.azi,
                        // We don't have exact coordinates from just MD/Inc/Az without calculation
                        // But if the file provided coords (WITSML often does), we could use them
                        // For now, we just store the raw telemetry
                    }
                });
            }
        });

        revalidatePath(`/dashboard/projects/${projectId}`);
        return { success: true, count: points.length };

    } catch (error) {
        console.error('Import error:', error);
        return { success: false, error: 'Failed to process file' };
    }
}
