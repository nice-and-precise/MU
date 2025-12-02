'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function saveRodPlan(projectId: string, rods: any[], settings: any) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        // Find the active bore or create a default one if none exists
        let bore = await prisma.bore.findFirst({
            where: { projectId, status: 'PLANNED' }
        });

        if (!bore) {
            // Check for any bore
            bore = await prisma.bore.findFirst({ where: { projectId } });
        }

        if (!bore) {
            // Create a default bore
            bore = await prisma.bore.create({
                data: {
                    projectId,
                    name: 'Bore 1',
                    status: 'PLANNED'
                }
            });
        }

        // Upsert BorePlan
        await prisma.borePlan.upsert({
            where: { boreId: bore.id },
            create: {
                boreId: bore.id,
                totalLength: rods.reduce((acc: number, r: any) => acc + r.length, 0),
                pipeDiameter: settings.diameter,
                pipeMaterial: settings.material,
                planData: JSON.stringify(rods),
                notes: 'Auto-saved plan'
            },
            update: {
                totalLength: rods.reduce((acc: number, r: any) => acc + r.length, 0),
                pipeDiameter: settings.diameter,
                pipeMaterial: settings.material,
                planData: JSON.stringify(rods),
                updatedAt: new Date()
            }
        });

        revalidatePath(`/dashboard/projects/${projectId}/plan`);
        return { success: true };
    } catch (error) {
        console.error('Failed to save plan:', error);
        return { success: false, error: 'Failed to save plan' };
    }
}

export async function getRodPlan(projectId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const bore = await prisma.bore.findFirst({
            where: { projectId },
            include: { borePlan: true }
        });

        if (bore && bore.borePlan) {
            return {
                success: true,
                data: {
                    rods: JSON.parse(bore.borePlan.planData || '[]'),
                    settings: {
                        diameter: bore.borePlan.pipeDiameter,
                        material: bore.borePlan.pipeMaterial,
                        declination: bore.declination,
                        soil: 'Clay' // Default or fetch from somewhere else if needed
                    }
                }
            };
        }

        return { success: true, data: null };
    } catch (error) {
        return { success: false, error: 'Failed to fetch plan' };
    }
}
