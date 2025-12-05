import { prisma } from '@/lib/prisma';
import { parseWitsml } from '@/lib/parsers/witsml';
import { parseCsv } from '@/lib/parsers/csv';

export const ImportService = {
    processSurveyFile: async (projectId: string, fileName: string, fileContent: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        let points: any[] = [];

        if (extension === 'xml' || extension === 'witsml') {
            points = await parseWitsml(fileContent);
        } else if (extension === 'csv') {
            points = await parseCsv(fileContent);
        } else {
            throw new Error('Unsupported file format');
        }

        if (points.length === 0) {
            throw new Error('No valid survey points found');
        }

        // Verify project exists
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { bores: true }
        });
        if (!project) throw new Error('Project not found');

        // Find or create a default bore
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

        const userId = project.createdById; // Fallback to project creator if user not known in context
        // Note: Ideally we'd use the authenticated user, but importSurveyData (FormAction) might be raw.
        // We will allow passing userId if available.

        await prisma.$transaction(async (tx) => {
            for (const p of points) {
                await tx.rodPass.create({
                    data: {
                        boreId,
                        sequence: Math.floor(p.md / 15),
                        passNumber: 1,
                        linearFeet: 15,
                        pitch: p.inc ? p.inc - 90 : 0,
                        azimuth: p.azi || 0,
                        depth: p.tvd || 0,
                        loggedById: userId
                    }
                });
            }
        });

        return { count: points.length };
    }
};
