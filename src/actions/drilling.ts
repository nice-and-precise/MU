'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { calculateNextStation } from '@/lib/drilling/math/mcm';
import { SurveyStation } from '@/lib/drilling/types';

export async function createBore(data: { projectId: string; name: string; totalLength?: number }) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const bore = await prisma.bore.create({
            data: {
                projectId: data.projectId,
                name: data.name,
                totalLength: data.totalLength,
                status: 'PLANNED',
            }
        });
        revalidatePath(`/dashboard/projects/${data.projectId}`);
        return { success: true, data: bore };
    } catch (error) {
        console.error('Failed to create bore:', error);
        return { success: false, error: 'Failed to create bore' };
    }
}

export async function getBoreDetails(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    return await prisma.bore.findUnique({
        where: { id },
        include: {
            rodPasses: { orderBy: { sequence: 'asc' } },
            project: true,
        }
    });
}

export async function addRodPass(data: {
    boreId: string;
    length: number;
    pitch: number;
    azimuth: number;
    fluidMix?: string;
    fluidVolume?: number;
}) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        // 1. Get previous rod pass or bore start
        const lastPass = await prisma.rodPass.findFirst({
            where: { boreId: data.boreId },
            orderBy: { sequence: 'desc' }
        });

        const bore = await prisma.bore.findUnique({ where: { id: data.boreId } });
        if (!bore) return { success: false, error: 'Bore not found' };

        // 2. Determine Previous Station
        let prevStation: SurveyStation;
        let prevMD = 0;
        let sequence = 1;
        let passNumber = 1;

        if (lastPass) {
            prevStation = {
                md: (lastPass.sequence * lastPass.linearFeet), // Approximation if lengths vary, but better to track MD
                // Actually, we should track cumulative MD. 
                // Let's assume for now we can reconstruct MD from sum of lengths.
                // Or better: store MD in RodPass? 
                // For now, let's just use the stored coordinates of the last pass.
                inc: 90 + (lastPass.pitch || 0), // Convert pitch to inclination
                azi: lastPass.azimuth || 0,
                tvd: lastPass.depth || 0,
                north: lastPass.north || 0,
                east: lastPass.east || 0,
            };
            // Re-calculate MD by summing all previous lengths? 
            // This is expensive. Let's just assume we store MD or calculate it from the last pass + length.
            // Wait, lastPass doesn't have MD stored. 
            // Let's assume MD = sum of lengths.
            // We can get the count * length if uniform, but lengths might vary.
            // Let's fetch the SUM of linearFeet.
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
                tvd: 0, // Start depth (usually 0 relative to entry)
                north: 0,
                east: 0,
            };
            prevMD = 0;
        }

        // 3. Calculate New Station
        const newMD = prevMD + data.length;
        const newInc = 90 + data.pitch; // Pitch is usually +Down, so 90 + pitch = Inc (0 is vertical up, 90 horizontal, 180 vertical down)
        // Wait, standard drilling: 0 is Vertical Down? No, usually 0 is Vertical Up in math, but in drilling 0 is Vertical Down often?
        // Let's stick to: 0 Pitch = Horizontal (90 Inc). +Pitch = Down (>90 Inc). -Pitch = Up (<90 Inc).

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
                loggedById: session.user.id,
                startedAt: new Date(), // Assume logged at start? Or completion?
                completedAt: new Date(),
            }
        });

        // Update Bore Status
        if (bore.status === 'PLANNED') {
            await prisma.bore.update({ where: { id: data.boreId }, data: { status: 'IN_PROGRESS' } });
        }

        revalidatePath(`/dashboard/projects/${bore.projectId}`);
        return { success: true, data: rodPass };

    } catch (error) {
        console.error('Failed to add rod pass:', error);
        return { success: false, error: 'Failed to add rod pass' };
    }
}
