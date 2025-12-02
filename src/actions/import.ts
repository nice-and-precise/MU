'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { parseWitsml } from '@/lib/parsers/witsml';
import { parseCsv } from '@/lib/parsers/csv';
import { requireAuth } from '@/lib/auth-utils';

export async function importSurveyData(formData: FormData) {
    try {
        await requireAuth();

        const file = formData.get('file') as File;
        const projectId = formData.get('projectId') as string;

        if (!file || !projectId) {
            return { success: false, error: 'Missing file or project ID' };
        }

        // Validation
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        if (file.size > MAX_SIZE) {
            return { success: false, error: 'File size exceeds 5MB limit' };
        }

        const extension = file.name.split('.').pop()?.toLowerCase();
        const allowedExtensions = ['csv', 'xml', 'witsml'];
        if (!extension || !allowedExtensions.includes(extension)) {
            return { success: false, error: 'Invalid file type. Allowed: .csv, .xml, .witsml' };
        }

        const buffer = await file.arrayBuffer();
        const content = new TextDecoder().decode(buffer);
        // extension is already declared above

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
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { bores: true }
        });
        if (!project) return { success: false, error: 'Project not found' };

        // Find or create a default bore for this import
        // If the file has a bore name, we could use it. For now, use the first bore or create "Imported Bore"
        let boreId = project.bores[0]?.id;

        if (!boreId) {
            const newBore = await prisma.bore.create({
                data: {
                    projectId,
                    name: `Imported Survey ${new Date().toLocaleDateString()}`,
                    status: 'PLANNED'
                }
            });
            boreId = newBore.id;
        }

        // Transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
            // Optional: Clear existing "As-Drilled" data if this is a full replace?
            // For now, we'll just append.

            // Get current user ID (mock for now, or passed in form data if needed)
            // In a real app, we'd get this from the session.
            // We'll need to fetch a valid user ID or make loggedById optional/default.
            // Looking at schema: loggedById is required.
            // Let's fetch the project creator as a fallback.
            const userId = project.createdById;

            for (const p of points) {
                await tx.rodPass.create({
                    data: {
                        boreId,
                        sequence: Math.floor(p.md / 15), // Approx sequence
                        passNumber: 1, // Pilot
                        linearFeet: 15, // Standard rod
                        pitch: p.inc ? p.inc - 90 : 0, // Convert Inc (0=Down) to Pitch (0=Horizontal)
                        azimuth: p.azi || 0,
                        depth: p.tvd || 0,
                        loggedById: userId
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
