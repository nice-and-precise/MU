'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function completeOnboarding() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { hasCompletedOnboarding: true },
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Failed to complete onboarding:", error);
        return { success: false, error: "Database error" };
    }
}
