import { prisma } from '@/lib/prisma';

export const EquipmentService = {
    createAsset: async (data: { name: string; type: string; model?: string; serialNumber?: string; status?: string }) => {
        return await prisma.asset.create({
            data: {
                name: data.name,
                type: data.type,
                model: data.model,
                serialNumber: data.serialNumber,
                status: data.status || 'AVAILABLE',
            }
        });
    },

    getAssets: async () => {
        return await prisma.asset.findMany({ orderBy: { name: 'asc' } });
    },

    createMaintenanceLog: async (data: {
        assetId: string;
        date: Date;
        type: string;
        description: string;
        cost: number;
        performedBy?: string
    }) => {
        return await prisma.maintenanceLog.create({
            data: {
                assetId: data.assetId,
                date: data.date,
                type: data.type,
                description: data.description,
                cost: data.cost,
                performedBy: data.performedBy,
            }
        });
    },

    getMaintenanceLogs: async (assetId: string) => {
        return await prisma.maintenanceLog.findMany({
            where: { assetId },
            orderBy: { date: 'desc' }
        });
    },

    createUsageLog: async (data: {
        assetId: string;
        projectId: string;
        date: Date;
        hours: number;
        notes?: string
    }) => {
        return await prisma.equipmentUsage.create({
            data: {
                assetId: data.assetId,
                projectId: data.projectId,
                date: data.date,
                hours: data.hours,
                notes: data.notes,
            }
        });
    }
};
