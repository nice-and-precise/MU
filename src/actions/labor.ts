'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// --- Employees ---

export async function createEmployee(data: { firstName: string; lastName: string; role: string; hourlyRate: number }) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const employee = await prisma.employee.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role,
                hourlyRate: data.hourlyRate,
            }
        });
        revalidatePath('/dashboard/labor');
        return { success: true, data: employee };
    } catch (error) {
        console.error('Failed to create employee:', error);
        return { success: false, error: 'Failed to create employee' };
    }
}

export async function getEmployees() {
    const session = await getServerSession(authOptions);
    if (!session) return [];
    return await prisma.employee.findMany({ orderBy: { lastName: 'asc' } });
}

// --- Crews ---

export async function createCrew(data: { name: string; foremanId?: string }) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const crew = await prisma.crew.create({
            data: {
                name: data.name,
                foremanId: data.foremanId,
            }
        });
        revalidatePath('/dashboard/labor');
        return { success: true, data: crew };
    } catch (error) {
        console.error('Failed to create crew:', error);
        return { success: false, error: 'Failed to create crew' };
    }
}

export async function getCrews() {
    const session = await getServerSession(authOptions);
    if (!session) return [];
    return await prisma.crew.findMany({
        include: { foreman: true },
        orderBy: { name: 'asc' }
    });
}

// --- Time Cards ---

export async function createTimeCard(data: {
    employeeId: string;
    projectId: string;
    date: Date;
    hours: number;
    code: string;
    notes?: string
}) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const timeCard = await prisma.timeCard.create({
            data: {
                employeeId: data.employeeId,
                projectId: data.projectId,
                date: data.date,
                hours: data.hours,
                code: data.code,
                notes: data.notes,
            }
        });
        revalidatePath(`/dashboard/projects/${data.projectId}`);
        return { success: true, data: timeCard };
    } catch (error) {
        console.error('Failed to create time card:', error);
        return { success: false, error: 'Failed to create time card' };
    }
}

export async function getTimeCards(projectId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return [];
    return await prisma.timeCard.findMany({
        where: { projectId },
        include: { employee: true },
        orderBy: { date: 'desc' }
    });
}
