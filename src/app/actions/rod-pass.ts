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
    const notes = formData.get("notes") as string;

    await prisma.rodPass.create({
        data: {
            boreId,
            sequence,
            passNumber: 1, // Defaulting to pilot for now
            linearFeet,
            notes,
            loggedById: session.user.id,
            startedAt: new Date(), // Mocking start time
            completedAt: new Date(), // Mocking completion time
        },
    });

    revalidatePath(`/dashboard/projects`);
    return { success: true };
}
