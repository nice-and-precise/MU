'use server'

import { prisma } from "@/lib/prisma"

export async function getActiveProjects() {
    try {
        const projects = await prisma.project.findMany({
            where: { status: { in: ['PLANNING', 'IN_PROGRESS'] } },
            orderBy: { updatedAt: 'desc' }
        });
        return { success: true, data: projects };
    } catch (error) {
        console.error("Failed to fetch projects:", error);
        return { success: false, error: "Failed to fetch projects" };
    }
}
