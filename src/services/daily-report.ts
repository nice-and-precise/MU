import { prisma } from '@/lib/prisma';
import { CreateDailyReportInput, UpdateDailyReportInput } from '@/schemas/daily-report';

export class DailyReportService {
    static async getReports() {
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

    static async getReport(id: string) {
        return await prisma.dailyReport.findUnique({
            where: { id },
            include: {
                project: { select: { name: true } },
                createdBy: { select: { name: true } },
                signedBy: { select: { name: true } },
            },
        });
    }

    static async createDailyReport(userId: string, data: CreateDailyReportInput) {
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

        return await prisma.dailyReport.create({
            data: {
                projectId,
                reportDate: new Date(reportDate),
                notes,
                createdById: userId,
                status: "DRAFT",
                crew: "[]", // Initialize empty JSON
            },
        });
    }

    static async updateDailyReport(id: string, data: UpdateDailyReportInput) {
        return await prisma.dailyReport.update({
            where: { id },
            data: {
                crew: data.crew ? JSON.stringify(data.crew) : undefined,
                production: data.production ? JSON.stringify(data.production) : undefined,
                materials: data.materials ? JSON.stringify(data.materials) : undefined,
                equipment: data.equipment ? JSON.stringify(data.equipment) : undefined,
                weather: data.weather,
                notes: data.notes,
            },
        });
    }

    static async getRecentProjectReport(projectId: string) {
        return await prisma.dailyReport.findFirst({
            where: {
                projectId,
                status: 'APPROVED'
            },
            orderBy: {
                reportDate: 'desc'
            },
            take: 1
        });
    }

    static async approveDailyReport(id: string, userId: string) {
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
                                userId: userId,
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

            for (const log of productionLogs) {
                if (log.lf && Number(log.lf) > 0) {
                    dailyFootage += Number(log.lf);

                    await tx.stationProgress.create({
                        data: {
                            projectId: report.projectId,
                            date: report.reportDate,
                            startStation: 0,
                            endStation: Number(log.lf),
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
                    signedById: userId,
                    signedAt: new Date(),
                }
            });

            // 6. Create Compliance Event for "Daily Report Approved" (Milestone)
            await tx.complianceEvent.create({
                data: {
                    projectId: report.projectId,
                    eventType: 'DAILY_REPORT_APPROVED',
                    details: `Report approved. Total Footage: ${dailyFootage}ft.`,
                    createdById: userId
                }
            });
        });

        return { success: true };
    }
}
