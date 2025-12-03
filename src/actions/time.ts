'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function clockIn(data: {
    employeeId: string;
    projectId?: string;
    lat: number;
    long: number;
    type?: "WORK" | "TRAVEL" | "BREAK";
}) {
    try {
        // Check if already clocked in
        const activeEntry = await prisma.timeEntry.findFirst({
            where: {
                employeeId: data.employeeId,
                endTime: null
            }
        });

        if (activeEntry) {
            return { success: false, error: "Already clocked in" };
        }

        const entry = await prisma.timeEntry.create({
            data: {
                employeeId: data.employeeId,
                projectId: data.projectId,
                startTime: new Date(),
                startLat: data.lat,
                startLong: data.long,
                type: data.type || "WORK",
                status: "PENDING"
            }
        });
        revalidatePath('/dashboard');
        return { success: true, data: entry };
    } catch (error) {
        console.error("Failed to clock in:", error);
        return { success: false, error: "Failed to clock in" };
    }
}

export async function clockOut(data: {
    employeeId: string;
    lat: number;
    long: number;
}) {
    try {
        const activeEntry = await prisma.timeEntry.findFirst({
            where: {
                employeeId: data.employeeId,
                endTime: null
            }
        });

        if (!activeEntry) {
            return { success: false, error: "Not clocked in" };
        }

        const entry = await prisma.timeEntry.update({
            where: { id: activeEntry.id },
            data: {
                endTime: new Date(),
                endLat: data.lat,
                endLong: data.long,
            }
        });
        revalidatePath('/dashboard');
        return { success: true, data: entry };
    } catch (error) {
        console.error("Failed to clock out:", error);
        return { success: false, error: "Failed to clock out" };
    }
}

export async function getClockStatus(employeeId: string) {
    try {
        const activeEntry = await prisma.timeEntry.findFirst({
            where: {
                employeeId,
                endTime: null
            }
        });
        return { success: true, data: activeEntry };
    } catch (error) {
        console.error("Failed to get clock status:", error);
        return { success: false, error: "Failed to get clock status" };
    }
}
