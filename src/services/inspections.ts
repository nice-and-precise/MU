import { prisma } from "@/lib/prisma";

export const InspectionService = {
    submitInspection: async (data: any, inspectorId: string) => {
        return await prisma.inspection.create({
            data: {
                assetId: data.assetId,
                createdById: inspectorId,
                projectId: data.projectId,
                type: data.type,
                passed: data.passed,
                items: JSON.stringify(data.defects),
                notes: data.notes ? `${data.notes} (Odometer: ${data.odometer}, Engine Hours: ${data.engineHours})` : `Odometer: ${data.odometer}, Engine Hours: ${data.engineHours}`,
            }
        });
    },

    getAssetInspections: async (assetId: string) => {
        const inspections = await prisma.inspection.findMany({
            where: { assetId },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        // Serialize dates to strings/JSON-safe objects if needed, 
        // but usually Server Actions return Dates fine to Client Components in newer Next.js.
        // However, to match original behavior of returning strings:
        return inspections.map(inspection => ({
            ...inspection,
            createdAt: inspection.createdAt.toISOString(),
            updatedAt: inspection.updatedAt.toISOString(),
            dueDate: inspection.dueDate?.toISOString() || null,
            completedAt: inspection.completedAt?.toISOString() || null,
        }));
    }
};
