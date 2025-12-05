import { prisma } from '@/lib/prisma';
import { calculateNextStation } from '@/lib/drilling/math/mcm';
import { SurveyStation } from '@/lib/drilling/types';

export const DrillingService = {
    createBore: async (data: { projectId: string; name: string; totalLength?: number }) => {
        return await prisma.bore.create({
            data: {
                projectId: data.projectId,
                name: data.name,
                totalLength: data.totalLength,
                status: 'PLANNED',
            }
        });
    },

    getBoreDetails: async (id: string) => {
        return await prisma.bore.findUnique({
            where: { id },
            include: {
                rodPasses: { orderBy: { sequence: 'asc' } },
                project: true,
            }
        });
    },

    addRodPass: async (userId: string, data: {
        boreId: string;
        length: number;
        pitch: number;
        azimuth: number;
        fluidMix?: string;
        fluidVolume?: number;
    }) => {
        // 1. Get previous rod pass or bore start
        const lastPass = await prisma.rodPass.findFirst({
            where: { boreId: data.boreId },
            orderBy: { sequence: 'desc' }
        });

        const bore = await prisma.bore.findUnique({ where: { id: data.boreId } });
        if (!bore) throw new Error('Bore not found');

        // 2. Determine Previous Station
        let prevStation: SurveyStation;
        let prevMD = 0;
        let sequence = 1;
        let passNumber = 1;

        if (lastPass) {
            prevStation = {
                md: (lastPass.sequence * lastPass.linearFeet), // Approximation
                inc: 90 + (lastPass.pitch || 0),
                azi: lastPass.azimuth || 0,
                tvd: lastPass.depth || 0,
                north: lastPass.north || 0,
                east: lastPass.east || 0,
            };

            // Re-calculate MD by summing all previous lengths
            const aggregations = await prisma.rodPass.aggregate({
                where: { boreId: data.boreId },
                _sum: { linearFeet: true }
            });
            prevMD = aggregations._sum.linearFeet || 0;
            prevStation.md = prevMD;

            sequence = lastPass.sequence + 1;
            passNumber = lastPass.passNumber + 1;
        } else {
            // Start of bore
            prevStation = {
                md: 0,
                inc: 90 + (bore.dip || 0), // Entry angle
                azi: bore.declination || 0, // Or 0 if relative
                tvd: 0, // Start depth
                north: 0,
                east: 0,
            };
            prevMD = 0;
        }

        // 3. Calculate New Station
        const newMD = prevMD + data.length;
        const newInc = 90 + data.pitch;

        const nextStation = calculateNextStation(
            prevStation,
            newMD,
            newInc,
            data.azimuth
        );

        // 4. Create Rod Pass
        const rodPass = await prisma.rodPass.create({
            data: {
                boreId: data.boreId,
                sequence,
                passNumber,
                linearFeet: data.length,
                pitch: data.pitch,
                azimuth: data.azimuth,
                depth: nextStation.tvd,
                north: nextStation.north,
                east: nextStation.east,
                dls: nextStation.dls,
                fluidMix: data.fluidMix,
                fluidVolumeGal: data.fluidVolume,
                loggedById: userId,
                startedAt: new Date(),
                completedAt: new Date(),
            }
        });

        // Update Bore Status
        if (bore.status === 'PLANNED') {
            await prisma.bore.update({ where: { id: data.boreId }, data: { status: 'IN_PROGRESS' } });
        }

        return rodPass;
    }
};
