"use server";

import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function getReports() {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

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
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

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
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

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
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

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
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const report = await prisma.dailyReport.findUnique({ where: { id } });
    if (!report) throw new Error("Report not found");

    if (report.status === 'APPROVED') {
        throw new Error("Report is already approved");
    }

    // Parse data
    const materials = JSON.parse(report.materials || '[]');
    const crew = JSON.parse(report.crew || '[]');
    const equipment = JSON.parse(report.equipment || '[]');

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

        // 2. Create Time Entries
        for (const member of crew) {
            if (member.employeeId && member.hours > 0) {
                await tx.timeEntry.create({
                    data: {
                        employeeId: member.employeeId,
                        projectId: report.projectId,
                        startTime: report.reportDate,
                        endTime: new Date(report.reportDate.getTime() + member.hours * 60 * 60 * 1000),
                        type: 'WORK',
                        status: 'APPROVED',
                        description: `Daily Report: ${member.role}`
                    }
                });
            }
        }

        // 3. Create Equipment Usage
        for (const eq of equipment) {
            if (eq.assetId && eq.hours > 0) {
                await tx.equipmentUsage.create({
                    data: {
                        assetId: eq.assetId,
                        projectId: report.projectId,
                        date: report.reportDate,
                        hours: eq.hours,
                        notes: 'Logged via Daily Report'
                    }
                });
            }
        }

        // 4. Update Project Progress (Production)
        const productionLogs = JSON.parse(report.production || '[]');
        let dailyFootage = 0;

        // Group by Bore to track total progress per bore
        const boreProgress = new Map<string, number>();

        for (const log of productionLogs) {
            // Assuming log structure: { activity: 'Drill', lf: 100, boreId: '...' }
            // If boreId is missing in log, we might default to a project bore or skip
            // For this implementation, we'll assume logs might not have boreId yet, 
            // but in a real scenario they should. We'll check if 'lf' exists.
            if (log.lf && Number(log.lf) > 0) {
                dailyFootage += Number(log.lf);

                // Create Station Progress Record
                // We don't have exact stationing in the simple log (just LF), 
                // so we'll just record the increment for now.
                // In a robust system, we'd query the previous end station.
                await tx.stationProgress.create({
                    data: {
                        projectId: report.projectId,
                        date: report.reportDate,
                        startStation: 0, // Placeholder: Delta tracking
                        endStation: Number(log.lf), // Placeholder: Delta tracking
                        status: 'COMPLETED',
                        notes: `Daily Report Production: ${log.activity}`
                    }
                });
            }
        }

        // 5. Update Report Status
        await tx.dailyReport.update({
            where: { id },
            data: {
                status: 'APPROVED',
                signedById: session.user.id,
                signedAt: new Date(),
            }
        });

        // 6. Create Compliance Event for "Daily Report Approved" (Milestone)
        await tx.complianceEvent.create({
            data: {
                projectId: report.projectId,
                eventType: 'DAILY_REPORT_APPROVED',
                details: `Report approved. Total Footage: ${dailyFootage}ft.`,
                createdById: session.user.id
            }
        });
    });

    return { success: true };
}
