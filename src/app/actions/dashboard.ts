"use server";

import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function getOwnerStats() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "OWNER") {
        throw new Error("Unauthorized");
    }

    const [activeProjects, totalRevenue, pendingApprovals, inventoryItems, activeFleet, openSafetyIssues] = await Promise.all([
        prisma.project.count({
            where: { status: "IN_PROGRESS" },
        }),
        // Revenue calculation is complex, simplified for now
        prisma.project.aggregate({
            _sum: { budget: true },
            where: { status: { in: ["IN_PROGRESS", "COMPLETED"] } },
        }),
        prisma.changeOrder.count({
            where: { status: "PENDING" },
        }),
        prisma.inventoryItem.findMany({
            select: { quantityOnHand: true, costPerUnit: true }
        }),
        prisma.asset.count({
            where: { status: "AVAILABLE" } // Assuming all assets are fleet/equipment for now
        }),
        prisma.correctiveAction.count({
            where: { status: "OPEN" }
        })
    ]);

    const inventoryValue = inventoryItems.reduce((acc, item) => {
        return acc + (item.quantityOnHand * (item.costPerUnit || 0));
    }, 0);

    return {
        activeProjects,
        totalRevenue: totalRevenue._sum.budget || 0,
        pendingApprovals,
        inventoryValue,
        activeFleet,
        openSafetyIssues
    };
}

export async function getSuperStats() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "SUPER" && session.user.role !== "OWNER")) {
        throw new Error("Unauthorized");
    }

    // In a real app, we'd filter by projects assigned to this super
    // For now, we'll just return global stats or mock the assignment logic
    const myProjects = await prisma.project.count({
        where: { status: "IN_PROGRESS" }, // TODO: Filter by assignment
    });

    const openInspections = await prisma.inspection.count({
        where: { status: "OPEN" },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyReportsToday = await prisma.dailyReport.count({
        where: {
            reportDate: {
                gte: today,
            },
        },
    });

    return {
        myProjects,
        openInspections,
        dailyReportsToday,
    };
}

export async function getCrewStats() {
    const session = await getServerSession(authOptions);
    if (!session) {
        throw new Error("Unauthorized");
    }

    // Mocking current assignment
    const currentAssignment = await prisma.project.findFirst({
        where: { status: "IN_PROGRESS" },
        include: { bores: true },
    });

    return {
        currentAssignment,
        todayProduction: 120, // Mocked for now, would need aggregation from RodPasses
    };
}
