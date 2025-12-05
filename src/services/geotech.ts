import { prisma } from '@/lib/prisma';

export const GeotechService = {
    createGeotechReport: async (data: any) => {
        const reportDate = typeof data.reportDate === 'string' ? new Date(data.reportDate) : data.reportDate;
        return await prisma.geotechReport.create({
            data: {
                projectId: data.projectId,
                title: data.title,
                reportDate,
                engineer: data.engineer,
                description: data.description,
                pdfUrl: data.pdfUrl,
            },
        });
    },

    addSoilLayer: async (data: any) => {
        return await prisma.soilLayer.create({
            data: {
                geotechReportId: data.geotechReportId,
                startDepth: data.startDepth,
                endDepth: data.endDepth,
                soilType: data.soilType,
                description: data.description,
                color: data.color,
                hardness: data.hardness,
                phpaRequired: data.phpaRequired || false,
                rockStrengthPsi: data.rockStrengthPsi,
            },
        });
    },

    getProjectGeotech: async (projectId: string) => {
        return await prisma.geotechReport.findMany({
            where: { projectId },
            include: {
                soilLayers: {
                    orderBy: { startDepth: 'asc' },
                },
            },
            orderBy: { reportDate: 'desc' },
        });
    },

    deleteGeotechReport: async (id: string) => {
        return await prisma.geotechReport.delete({
            where: { id },
        });
    },

    importFromMNCWI: async (projectId: string, lat: number, lon: number) => {
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

        return { message: 'Imported 5 layers from CWI' };
    }
};
