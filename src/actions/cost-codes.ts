'use server';

import { prisma } from '@/lib/prisma';

export async function getCostItems() {
    try {
        const items = await prisma.costItem.findMany({
            where: { isActive: true },
            include: { category: true },
            orderBy: { code: 'asc' }
        });
        return { success: true, data: items };
    } catch (error) {
        console.error("Error fetching cost items:", error);
        return { success: false, error: "Failed to fetch cost items" };
    }
}
