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
