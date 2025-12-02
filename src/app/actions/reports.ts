"use server";

import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAuth } from "@/lib/auth-utils";

const prisma = new PrismaClient();

export async function getReports() {
    const session = await requireAuth();

    return await prisma.dailyReport.findMany({
        orderBy: { reportDate: "desc" },
        include: {
            project: {
                select: { name: true },
            },
            createdBy: {
                select: { name: true },
            },
        },
    });
}

export async function createDailyReport(data: { projectId: string; reportDate: string; notes?: string }) {
    const session = await requireAuth();

    const { projectId, reportDate, notes } = data;

    // Check if report already exists for this date/project
    const existing = await prisma.dailyReport.findUnique({
        where: {
            projectId_reportDate: {
                projectId,
                reportDate: new Date(reportDate),
            },
        },
    });

    if (existing) {
        throw new Error("A report for this project and date already exists.");
    }

    const report = await prisma.dailyReport.create({
        data: {
            projectId,
            reportDate: new Date(reportDate),
            notes,
            createdById: session.user.id,
            status: "DRAFT",
            crew: "[]", // Initialize empty JSON
        },
    });

    return report;
}
export async function getReport(id: string) {
    const session = await requireAuth();

    const report = await prisma.dailyReport.findUnique({
        where: { id },
        include: {
            project: { select: { name: true } },
            createdBy: { select: { name: true } },
            signedBy: { select: { name: true } },
        },
    });

    return report;
}

export async function updateDailyReport(id: string, data: any) {
    const session = await requireAuth();

    // TODO: Add validation for data structure if needed
    // For now, we assume the client sends valid JSON strings for crew, production, materials

    const report = await prisma.dailyReport.update({
        where: { id },
        data: {
            crew: data.crew,
            production: data.production,
            materials: data.materials,
            equipment: data.equipment,
            weather: data.weather,
            notes: data.notes,
        },
    });

    return report;
}

export async function approveDailyReport(id: string) {
    const session = await requireAuth();

    const report = await prisma.dailyReport.findUnique({ where: { id } });
    if (!report) throw new Error("Report not found");

    if (report.status === 'APPROVED') {
        throw new Error("Report is already approved");
    }

    // Parse materials to deduct inventory
    const materials = JSON.parse(report.materials || '[]');

    await prisma.$transaction(async (tx) => {
        // 1. Deduct Inventory
        for (const mat of materials) {
            if (mat.inventoryItemId && mat.quantity > 0) {
                const item = await tx.inventoryItem.findUnique({ where: { id: mat.inventoryItemId } });
                if (item) {
                    await tx.inventoryItem.update({
                        where: { id: mat.inventoryItemId },
                        data: { quantityOnHand: item.quantityOnHand - mat.quantity }
                    });

                    await tx.inventoryTransaction.create({
                        data: {
                            itemId: mat.inventoryItemId,
                            type: 'OUT',
                            quantity: mat.quantity,
                            projectId: report.projectId,
                            userId: session.user.id,
                            notes: `Used in Daily Report ${report.reportDate.toISOString().split('T')[0]}`
                        }
                    });
                }
            }
        }

        // 2. Update Report Status
        await tx.dailyReport.update({
            where: { id },
            data: {
                status: 'APPROVED',
                signedById: session.user.id,
                signedAt: new Date(),
            }
        });
    });

    return { success: true };
}
