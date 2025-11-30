"use server";

import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function logRodPass(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const boreId = formData.get("boreId") as string;
    const sequence = parseInt(formData.get("sequence") as string);
    const linearFeet = parseFloat(formData.get("linearFeet") as string);
    const pitch = parseFloat(formData.get("pitch") as string) || null;
    const azimuth = parseFloat(formData.get("azimuth") as string) || null;
    const depth = parseFloat(formData.get("depth") as string) || null;

    // Detailed Reporting Fields
    const viscosity = parseFloat(formData.get("viscosity") as string) || null;
    const mudWeight = parseFloat(formData.get("mudWeight") as string) || null;
    const reamerDiameter = parseFloat(formData.get("reamerDiameter") as string) || null;
    const steeringToolFace = parseFloat(formData.get("steeringToolFace") as string) || null;

    const notes = formData.get("notes") as string;

    const newPass = await prisma.rodPass.create({
        data: {
            boreId,
            sequence,
            passNumber: 1, // Defaulting to pilot for now
            linearFeet,
            pitch,
            azimuth,
            depth,
            viscosity,
            mudWeight,
            reamerDiameter,
            steeringToolFace,
            notes,
            loggedById: session.user.id,
            startedAt: new Date(), // Mocking start time
            completedAt: new Date(), // Mocking completion time
        },
    });

    revalidatePath(`/dashboard/projects`);
    return { success: true, data: newPass };
}

export async function getLastRodPass(boreId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    const lastPass = await prisma.rodPass.findFirst({
        where: { boreId },
        orderBy: { sequence: 'desc' },
    });

    return lastPass;
}
