"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const rodPassSchema = z.object({
    boreId: z.string(),
    sequence: z.number(),
    passNumber: z.number(),
    linearFeet: z.number(),
    depth: z.number(),
    pitch: z.number(),
    steerPosition: z.number().optional(), // Clock face 1-12
    pullbackForce: z.number().optional(),
    fluidMix: z.string().optional(),
    viscosity: z.number().optional(),
    returnsVisual: z.string().optional(),
    notes: z.string().optional(),
    loggedById: z.string(),
});

export async function createRodPass(data: z.infer<typeof rodPassSchema>) {
    try {
        const rodPass = await prisma.rodPass.create({
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

        revalidatePath(`/projects/${data.boreId}`); // Adjust path as needed
        return { success: true, data: rodPass };
    } catch (error) {
        console.error("Failed to create rod pass:", error);
        return { success: false, error: "Failed to create rod pass" };
    }
}

export async function getBoreLogs(boreId: string) {
    try {
        const logs = await prisma.rodPass.findMany({
            where: { boreId },
            orderBy: { sequence: "asc" },
            include: { loggedBy: true },
        });
        return { success: true, data: logs };
    } catch (error) {
        console.error("Failed to fetch bore logs:", error);
        return { success: false, error: "Failed to fetch bore logs" };
    }
}

const potholeSchema = z.object({
    projectId: z.string(),
    utilityType: z.string(),
    depth: z.number(),
    visualVerificationPhoto: z.string(),
    notes: z.string().optional(),
    createdById: z.string(),
});

export async function createPothole(data: z.infer<typeof potholeSchema>) {
    try {
        const pothole = await prisma.pothole.create({
            data: {
                projectId: data.projectId,
                utilityType: data.utilityType,
                depth: data.depth,
                visualVerificationPhoto: data.visualVerificationPhoto,
                notes: data.notes,
                createdById: data.createdById,
            },
        });
        revalidatePath(`/projects/${data.projectId}`);
        return { success: true, data: pothole };
    } catch (error) {
        console.error("Failed to create pothole:", error);
        return { success: false, error: "Failed to create pothole" };
    }
}
