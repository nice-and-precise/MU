"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getProjects() {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    return await prisma.project.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
            _count: {
                select: { bores: true, dailyReports: true },
            },
        },
    });
}

export async function getProject(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    return await prisma.project.findUnique({
        where: { id },
        include: {
            bores: {
                select: {
                    id: true,
                    name: true,
                    totalLength: true,
                    productMaterial: true,
                    status: true,
                }
            },
            dailyReports: {
                orderBy: { reportDate: "desc" },
                take: 5,
                select: {
                    id: true,
                    reportDate: true,
                    notes: true,
                    status: true,
                }
            },
            tickets811: {
                select: {
                    id: true,
                    ticketNumber: true,
                    expirationDate: true,
                    status: true,
                }
            },
            stationProgress: {
                orderBy: { date: 'desc' },
            },
        },
    });
}
