'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getEmployees() {
    try {
        const employees = await prisma.employee.findMany({
            include: {
                user: true,
                crews: {
                    include: {
                        crew: true
                    }
                },
                foremanCrews: true,
                certs: true,
            },
            orderBy: { lastName: 'asc' }
        })
        return { success: true, data: employees }
    } catch (error) {
        console.error("Failed to fetch employees:", error)
        return { success: false, error: "Failed to fetch employees" }
    }
}

export async function getEmployee(id: string) {
    try {
        const employee = await prisma.employee.findUnique({
            where: { id },
            include: {
                user: true,
                crews: {
                    include: {
                        crew: true
                    }
                },
                certs: true,
                incidents: true,
                documents: true,
                statusHistory: {
                    orderBy: { effectiveDate: 'desc' }
                }
            }
        })
        return { success: true, data: employee }
    } catch (error) {
        console.error("Failed to fetch employee:", error)
        return { success: false, error: "Failed to fetch employee" }
    }
}

export async function createEmployee(data: Prisma.EmployeeCreateInput) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const employee = await prisma.employee.create({
            data,
        })
        revalidatePath('/dashboard/labor')
        return { success: true, data: employee }
    } catch (error) {
        console.error("Failed to create employee:", error)
        return { success: false, error: "Failed to create employee" }
    }
}

export async function updateEmployee(id: string, data: Prisma.EmployeeUpdateInput) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const employee = await prisma.employee.update({
            where: { id },
            data,
        })
        revalidatePath('/dashboard/labor')
        revalidatePath(`/dashboard/labor/${id}`)
        return { success: true, data: employee }
    } catch (error) {
        console.error("Failed to update employee:", error)
        return { success: false, error: "Failed to update employee" }
    }
}

export async function deleteEmployee(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        await prisma.employee.delete({
            where: { id }
        })
        revalidatePath('/dashboard/labor')
        return { success: true }
    } catch (error) {
        console.error("Failed to delete employee:", error)
        return { success: false, error: "Failed to delete employee" }
    }
}

export async function getAvailableCrewMembers() {
    try {
        const employees = await prisma.employee.findMany({
            where: { status: "ACTIVE" },
            orderBy: { lastName: 'asc' }
        })
        return { success: true, data: employees }
    } catch (error) {
        console.error("Failed to fetch available crew members:", error)
        return { success: false, error: "Failed to fetch crew members" }
    }
}
