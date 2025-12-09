'use server';

import { prisma } from '@/lib/prisma';
import { seedDemoData } from '@/lib/seed/seedDemoData';
import { revalidatePath } from 'next/cache';

export async function seedFullDemoData() {
    try {
        console.log('Starting full demo seed via Server Action...');

        await seedDemoData(prisma);

        revalidatePath('/');
        return { success: true, message: 'Full demo data seeded successfully!' };
    } catch (error) {
        console.error('Error seeding full demo data:', error);
        return { success: false, message: 'Failed to seed demo data. Check logs.' };
    }
}
