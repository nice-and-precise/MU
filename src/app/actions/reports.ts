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
