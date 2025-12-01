'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// --- Assets ---

export async function createAsset(data: { name: string; type: string; model?: string; serialNumber?: string; status?: string }) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const asset = await prisma.asset.create({
            data: {
                name: data.name,
                type: data.type,
                model: data.model,
                serialNumber: data.serialNumber,
                status: data.status || 'AVAILABLE',
            }
        });
        revalidatePath('/dashboard/equipment');
        return { success: true, data: asset };
    } catch (error) {
        console.error('Failed to create asset:', error);
        return { success: false, error: 'Failed to create asset' };
    }
}

export async function getAssets() {
    const session = await getServerSession(authOptions);
    if (!session) return [];
    return await prisma.asset.findMany({ orderBy: { name: 'asc' } });
}

// --- Maintenance ---

export async function createMaintenanceLog(data: {
    assetId: string;
    date: Date;
    type: string;
    description: string;
    cost: number;
    performedBy?: string
}) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const log = await prisma.maintenanceLog.create({
            data: {
                assetId: data.assetId,
                date: data.date,
                type: data.type,
                description: data.description,
                cost: data.cost,
                performedBy: data.performedBy,
            }
        });
        revalidatePath('/dashboard/equipment');
        return { success: true, data: log };
    } catch (error) {
        console.error('Failed to create maintenance log:', error);
        return { success: false, error: 'Failed to create maintenance log' };
    }
}

export async function getMaintenanceLogs(assetId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return [];
    return await prisma.maintenanceLog.findMany({
        where: { assetId },
        orderBy: { date: 'desc' }
    });
}

// --- Usage ---

export async function createUsageLog(data: {
    assetId: string;
    projectId: string;
    date: Date;
    hours: number;
    notes?: string
}) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const log = await prisma.equipmentUsage.create({
            data: {
                assetId: data.assetId,
                projectId: data.projectId,
                date: data.date,
                hours: data.hours,
                notes: data.notes,
            }
        });
        revalidatePath(`/dashboard/projects/${data.projectId}`);
        return { success: true, data: log };
    } catch (error) {
        console.error('Failed to create usage log:', error);
        return { success: false, error: 'Failed to create usage log' };
    }
}
