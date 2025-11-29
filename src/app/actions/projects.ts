"use server";

import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

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
            bores: true,
            dailyReports: {
                orderBy: { reportDate: "desc" },
                take: 5,
            },
            tickets811: true,
        },
    });
}
