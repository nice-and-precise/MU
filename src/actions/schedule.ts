'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { checkConflicts } from "./conflicts"

export async function getShifts(start: Date, end: Date) {
    try {
        const shifts = await prisma.shift.findMany({
            where: {
                startTime: {
                    gte: start,
                    lte: end
                }
            },
            include: {
                project: true,
                crew: true,
                employee: true,
                assets: {
                    include: {
                        asset: true
                    }
                }
            },
            orderBy: { startTime: 'asc' }
        })
        return { success: true, data: shifts }
    } catch (error) {
        console.error("Failed to fetch shifts:", error)
        return { success: false, error: "Failed to fetch shifts" }
    }
}

export async function createShift(data: {
    projectId: string;
    crewId?: string;
    employeeId?: string;
    startTime: Date;
    endTime: Date;
    assetIds?: string[];
    notes?: string;
    force?: boolean;
}) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        // Check conflicts first unless forced
        if (!data.force) {
            const conflicts = await checkConflicts({
                startTime: data.startTime,
                endTime: data.endTime,
                crewId: data.crewId,
                employeeId: data.employeeId,
                assetIds: data.assetIds
            });

            if (conflicts.length > 0) {
                return { success: false, error: "Conflicts detected", conflicts };
            }
        }

        const shift = await prisma.shift.create({
            data: {
                projectId: data.projectId,
                crewId: data.crewId,
                employeeId: data.employeeId,
                startTime: data.startTime,
                endTime: data.endTime,
                notes: data.notes,
                assets: {
                    create: data.assetIds?.map(id => ({
                        assetId: id
                    })) || []
                }
            }
        })
        revalidatePath('/dashboard/dispatch')
        return { success: true, data: shift }
    } catch (error) {
        console.error("Failed to create shift:", error)
        return { success: false, error: "Failed to create shift" }
    }
}

export async function updateShift(id: string, data: {
    startTime?: Date;
    endTime?: Date;
    notes?: string;
    status?: string;
}) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const shift = await prisma.shift.update({
            where: { id },
            data
        })
        revalidatePath('/dashboard/dispatch')
        return { success: true, data: shift }
    } catch (error) {
        console.error("Failed to update shift:", error)
        return { success: false, error: "Failed to update shift" }
    }
}

export async function deleteShift(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        await prisma.shift.delete({
            where: { id }
        })
        revalidatePath('/dashboard/dispatch')
        return { success: true }
    } catch (error) {
        console.error("Failed to delete shift:", error)
        return { success: false, error: "Failed to delete shift" }
    }
}
