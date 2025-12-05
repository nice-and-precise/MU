import { prisma } from '@/lib/prisma';
import { BorePlanInput, FluidPlanInput } from '@/schemas/engineering';
import { calculatePullbackForce } from '@/lib/drilling/math/loads';
import { analyzeFracOutRisk, SoilLayerInput } from '@/lib/drilling/math/hydraulics';

// Helper to avoid circular dependency or complex imports if utils are not pure
// We will import utils dynamically if needed, or assume they are pure functions.
// The original code used dynamic imports for utils.

export class EngineeringService {

    private static async getProjectSoilLayers(boreId: string): Promise<SoilLayerInput[]> {
        const bore = await prisma.bore.findUnique({
            where: { id: boreId },
            include: {
                project: {
                    include: {
                        geotechReports: {
                            include: { soilLayers: true }
                        }
                    }
                }
            }
        });

        if (!bore || !bore.project.geotechReports.length) return [];

        // Flatten layers from all reports (or just take the first report)
        return bore.project.geotechReports[0].soilLayers.map(l => ({
            startDepth: l.startDepth,
            endDepth: l.endDepth,
            soilType: l.soilType,
            hardness: l.hardness,
            rockStrengthPsi: l.rockStrengthPsi
        }));
    }

    static async upsertBorePlan(data: BorePlanInput) {
        // Fetch Soil Layers & Bore Data for Trajectory
        const [soilLayers, boreData] = await Promise.all([
            this.getProjectSoilLayers(data.boreId),
            prisma.bore.findUnique({
                where: { id: data.boreId },
                include: { rodPasses: true }
            })
        ]);

        let estimatedPullback = 0;
        let calculationMethod = 'ASTM F1962 (Simplified)';

        // Try detailed calculation (Capstan Effect) if trajectory exists
        if (boreData) {
            // We need to dynamically import these if they are not available at top level or to match original behavior
            const { convertBoreToTrajectory } = await import('@/lib/drilling/utils');
            const { calculateDetailedPullback } = await import('@/lib/drilling/math/loads');

            const trajectory = convertBoreToTrajectory({
                rodPasses: boreData.rodPasses,
                borePlan: data as any
            });

            if (trajectory && trajectory.length > 1) {
                estimatedPullback = calculateDetailedPullback(
                    trajectory,
                    data.pipeDiameter,
                    data.pipeMaterial as any,
                    soilLayers.length > 0 ? soilLayers : 'Clay'
                );
                calculationMethod = 'ASTM F1962 (Detailed / Capstan)';
            } else {
                // Fallback to simplified
                estimatedPullback = calculatePullbackForce(
                    data.totalLength,
                    data.pipeDiameter,
                    data.pipeMaterial as any,
                    soilLayers.length > 0 ? soilLayers : 'Clay',
                    data.safetyFactor || 1.5
                );
            }
        }

        return await prisma.borePlan.upsert({
            where: { boreId: data.boreId },
            update: {
                ...data,
                pullbackForce: estimatedPullback,
                notes: calculationMethod
            },
            create: {
                ...data,
                pullbackForce: estimatedPullback,
                notes: calculationMethod
            },
        });
    }

    static async upsertFluidPlan(data: FluidPlanInput) {
        // --- FRAC-OUT ANALYSIS ---
        const borePlan = await prisma.borePlan.findUnique({
            where: { id: data.borePlanId },
            include: { bore: true }
        });

        let fracOutRisk = 'Low';

        if (borePlan) {
            const soilLayers = await this.getProjectSoilLayers(borePlan.boreId);

            // Assumptions for calculation
            const estimatedDepth = borePlan.totalLength * 0.15;

            const fluidProps = {
                density: 9.0, // ppg
                viscosity: 15, // cP
                yieldPoint: 20 // lb/100ft2
            };

            const geo = {
                holeDiameterIn: borePlan.pipeDiameter * 1.5,
                pipeDiameterIn: borePlan.pipeDiameter,
                lengthFt: borePlan.totalLength,
                depthFt: estimatedDepth
            };

            let layersToUse = soilLayers;
            if (layersToUse.length === 0) {
                layersToUse = [{
                    startDepth: 0,
                    endDepth: 1000,
                    soilType: data.soilType
                }];
            }

            const analysis = analyzeFracOutRisk(
                fluidProps,
                geo,
                layersToUse,
                data.pumpRate || 50
            );

            fracOutRisk = analysis.riskLevel;
        }

        const plan = await prisma.fluidPlan.upsert({
            where: { borePlanId: data.borePlanId },
            update: data,
            create: data,
        });

        // Update parent BorePlan with risk
        await prisma.borePlan.update({
            where: { id: data.borePlanId },
            data: { fracOutRisk }
        });

        return plan;
    }

    static async getBoreEngineering(boreId: string) {
        return await prisma.borePlan.findUnique({
            where: { boreId },
            include: { fluidPlan: true },
        });
    }
}
