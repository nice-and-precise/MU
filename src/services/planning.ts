import { prisma } from '@/lib/prisma';

export const PlanningService = {
    saveRodPlan: async (projectId: string, rods: any[], settings: any) => {
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
    },

    getRodPlan: async (projectId: string) => {
        const bore = await prisma.bore.findFirst({
            where: { projectId },
            include: { borePlan: true }
        });

        if (bore && bore.borePlan) {
            return {
                rods: JSON.parse(bore.borePlan.planData || '[]'),
                settings: {
                    diameter: bore.borePlan.pipeDiameter,
                    material: bore.borePlan.pipeMaterial,
                    declination: bore.declination,
                    soil: 'Clay' // Default or fetch from somewhere else if needed
                }
            };
        }

        return null;
    }
};
