import { prisma } from '@/lib/prisma';
import { CreateDailyReportInput, UpdateDailyReportInput } from '@/schemas/daily-report';
import { AuditService } from './audit';
import { AuditAction, LaborType, MeasurementUnit } from '@prisma/client';

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
                // Include relations for verification if needed, but UI uses JSON fields for now
                laborEntries: { include: { employee: true } },
                equipmentEntries: { include: { asset: true } },
                materialEntries: true,
                productionEntries: true,
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

        const report = await prisma.dailyReport.create({
            data: {
                projectId,
                reportDate: new Date(reportDate),
                notes,
                createdById: userId,

                status: "DRAFT",
            },
        });

        await AuditService.log(AuditAction.CREATE, 'DailyReport', report.id, userId);

        return report;
    }

    static async updateDailyReport(id: string, data: UpdateDailyReportInput, userId: string) {
        return await prisma.$transaction(async (tx) => {
            // 1. Update Relations (Delete All + Create All)

            // Labor
            if (data.crew) {
                await tx.dailyReportLabor.deleteMany({ where: { dailyReportId: id } });
                for (const member of data.crew) {
                    await tx.dailyReportLabor.create({
                        data: {
                            dailyReportId: id,
                            employeeId: member.employeeId,
                            hours: member.hours,
                            type: LaborType.REGULAR, // Defaulting to REGULAR for now
                            costCode: member.role, // Storing role in costCode as per migration strategy
                            costItemId: member.costItemId,
                        }
                    });
                }
            }

            // Equipment
            if (data.equipment) {
                await tx.dailyReportEquipment.deleteMany({ where: { dailyReportId: id } });
                for (const eq of data.equipment) {
                    await tx.dailyReportEquipment.create({
                        data: {
                            dailyReportId: id,
                            assetId: eq.assetId,
                            hours: eq.hours,
                            costItemId: eq.costItemId,
                        }
                    });
                }
            }

            // Materials
            if (data.materials) {
                await tx.dailyReportMaterial.deleteMany({ where: { dailyReportId: id } });
                for (const mat of data.materials) {
                    // Fetch details for name/unit
                    const item = await tx.inventoryItem.findUnique({ where: { id: mat.inventoryItemId } });

                    // Safe cast or default for unit
                    let unit: MeasurementUnit = MeasurementUnit.EA;
                    if (item?.unit) {
                        const upperUnit = item.unit.toUpperCase();
                        if (upperUnit in MeasurementUnit) {
                            unit = upperUnit as MeasurementUnit;
                        }
                    }

                    await tx.dailyReportMaterial.create({
                        data: {
                            dailyReportId: id,
                            inventoryItemId: mat.inventoryItemId,
                            quantity: mat.quantity,
                            name: item?.name || "Unknown",
                            unit: unit,
                            costItemId: mat.costItemId,
                        }
                    });
                }
            }

            // Production
            if (data.production) {
                await tx.dailyReportProduction.deleteMany({ where: { dailyReportId: id } });
                for (const prod of data.production) {
                    const descParts = [prod.activity];
                    if (prod.pitch) descParts.push(`Pitch: ${prod.pitch}`);
                    if (prod.azimuth) descParts.push(`Az: ${prod.azimuth}`);

                    await tx.dailyReportProduction.create({
                        data: {
                            dailyReportId: id,
                            quantity: prod.lf,
                            unit: MeasurementUnit.FT,
                            description: descParts.join(', '),
                            costItemId: prod.costItemId,
                        }
                    });
                }
            }

            // 2. Update DailyReport (including JSON sync)
            const updated = await tx.dailyReport.update({
                where: { id },
                data: {
                    weather: data.weather,
                    notes: data.notes,
                },
            });

            // Log Audit Event
            await AuditService.log(AuditAction.UPDATE, 'DailyReport', id, userId);

            return updated;
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
            take: 1,
            include: {
                laborEntries: true
            }
        });
    }

    static async approveDailyReport(id: string, userId: string) {
        // Fetch report with relations
        const report = await prisma.dailyReport.findUnique({
            where: { id },
            include: {
                laborEntries: true,
                equipmentEntries: true,
                materialEntries: true,
                productionEntries: true
            }
        });

        if (!report) throw new Error("Report not found");

        if (report.status === 'APPROVED') {
            throw new Error("Report is already approved");
        }

        // Validation: Enforce Cost Codes (ER-P Spine)
        const missingLaborCost = report.laborEntries.filter(e => !e.costItemId && e.hours > 0);
        const missingEquipmentCost = report.equipmentEntries.filter(e => !e.costItemId && e.hours > 0);

        if (missingLaborCost.length > 0 || missingEquipmentCost.length > 0) {
            throw new Error(`Cannot approve report. Missing Cost Codes for ${missingLaborCost.length} labor entries and ${missingEquipmentCost.length} equipment entries.`);
        }

        await prisma.$transaction(async (tx) => {
            // 1. Deduct Inventory (Use materialEntries)
            for (const mat of report.materialEntries) {
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

            // 2. Create Time Entries (Use laborEntries)
            for (const member of report.laborEntries) {
                if (member.employeeId && member.hours > 0) {
                    await tx.timeEntry.create({
                        data: {
                            employeeId: member.employeeId,
                            projectId: report.projectId,
                            startTime: report.reportDate,
                            endTime: new Date(report.reportDate.getTime() + member.hours * 60 * 60 * 1000),
                            type: 'WORK',
                            status: 'APPROVED',
                            description: `Daily Report: ${member.costCode || 'Worker'}`, // Use costCode as Role
                            costItemId: member.costItemId
                        }
                    });
                }
            }

            // 3. Create Equipment Usage (Use equipmentEntries)
            for (const eq of report.equipmentEntries) {
                if (eq.assetId && eq.hours > 0) {
                    await tx.equipmentUsage.create({
                        data: {
                            assetId: eq.assetId,
                            projectId: report.projectId,
                            date: report.reportDate,
                            hours: eq.hours,
                            notes: 'Logged via Daily Report',
                            costItemId: eq.costItemId
                        }
                    });
                }
            }

            // 4. Update Project Progress (Use productionEntries)
            // Fetch latest station progress to determine start point
            const lastProgress = await tx.stationProgress.findFirst({
                where: { projectId: report.projectId },
                orderBy: { endStation: 'desc' },
            });

            let currentStation = lastProgress?.endStation || 0;
            let dailyFootage = 0;

            for (const prod of report.productionEntries) {
                if (prod.quantity > 0 && prod.unit === 'FT') {
                    const startStation = currentStation;
                    const endStation = currentStation + prod.quantity;

                    dailyFootage += prod.quantity;
                    currentStation = endStation;

                    await tx.stationProgress.create({
                        data: {
                            projectId: report.projectId,
                            date: report.reportDate,
                            startStation,
                            endStation,
                            status: 'COMPLETED',
                            notes: `Daily Report Production: ${prod.description}`
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

            // 6. Create Compliance Event
            if (dailyFootage > 0) {
                await tx.complianceEvent.create({
                    data: {
                        projectId: report.projectId,
                        eventType: 'DAILY_REPORT_APPROVED',
                        details: `Report approved. Total Footage: ${dailyFootage}ft.`,
                        createdById: userId
                    }
                });
            }
        });

        // Log Audit Event (Outside transaction, best effort)
        await AuditService.log(AuditAction.APPROVE, 'DailyReport', id, userId);

        return { success: true };
    }
}
