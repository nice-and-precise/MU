import { prisma } from '@/lib/prisma';
import { CreateRodPassManualSchema, CreatePotholeSchema } from '@/schemas/hdd';
import { z } from 'zod';

type CreateRodPassData = z.infer<typeof CreateRodPassManualSchema> & { loggedById: string };
type CreatePotholeData = z.infer<typeof CreatePotholeSchema> & { createdById: string };

export const HDDService = {
    async createRodPass(data: CreateRodPassData) {
        return await prisma.rodPass.create({
            data: {
                boreId: data.boreId,
                sequence: data.sequence,
                passNumber: data.passNumber,
                linearFeet: data.linearFeet,
                depth: data.depth,
                pitch: data.pitch,
                steeringToolFace: data.steerPosition,
                pullbackForce: data.pullbackForce,
                fluidMix: data.fluidMix,
                viscosity: data.viscosity,
                returnsVisual: data.returnsVisual,
                notes: data.notes,
                loggedById: data.loggedById,
            },
        });
    },

    async getBoreLogs(boreId: string) {
        return await prisma.rodPass.findMany({
            where: { boreId },
            orderBy: { sequence: "asc" },
            include: { loggedBy: true },
        });
    },

    async createPothole(data: CreatePotholeData) {
        return await prisma.pothole.create({
            data: {
                projectId: data.projectId,
                utilityType: data.utilityType,
                depth: data.depth,
                visualVerificationPhoto: data.visualVerificationPhoto,
                notes: data.notes,
                createdById: data.createdById,
            },
        });
    }
};
