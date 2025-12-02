'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitInspection(data: {
    assetId: string;
    inspectorId: string;
    projectId: string;
    type: 'Pre-Trip' | 'Post-Trip';
    passed: boolean;
    defects: string[]; // JSON string or array
    notes?: string;
    odometer?: number;
    engineHours?: number;
}) {
    try {
        const inspection = await prisma.inspection.create({
            data: {
                assetId: data.assetId,
                createdById: data.inspectorId,
                projectId: data.projectId,
                type: data.type,
                passed: data.passed,
                items: JSON.stringify(data.defects),
                notes: data.notes ? `${data.notes} (Odometer: ${data.odometer}, Engine Hours: ${data.engineHours})` : `Odometer: ${data.odometer}, Engine Hours: ${data.engineHours}`,
            }
        });

        revalidatePath('/dashboard');
        return { success: true, data: inspection };
    } catch (error) {
        console.error("Failed to submit inspection:", error);
        return { success: false, error: "Failed to submit inspection" };
    }
}

export async function getAssetInspections(assetId: string) {
    try {
        const inspections = await prisma.inspection.findMany({
            where: { assetId },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        // Serialize dates to strings to avoid Next.js serialization warnings/errors
        const serializedInspections = inspections.map(inspection => ({
            ...inspection,
            createdAt: inspection.createdAt.toISOString(),
            updatedAt: inspection.updatedAt.toISOString(),
            dueDate: inspection.dueDate?.toISOString() || null,
            completedAt: inspection.completedAt?.toISOString() || null,
        }));

        return { success: true, data: serializedInspections };
    } catch (error) {
        console.error("Failed to fetch inspections:", error);
        return { success: false, error: "Failed to fetch inspections" };
    }
}
