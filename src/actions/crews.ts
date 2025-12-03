'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getCrews() {
    try {
        const crews = await prisma.crew.findMany({
            include: {
                foreman: true,
                members: {
                    include: {
                        employee: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        })
        return { success: true, data: crews }
    } catch (error) {
        console.error("Failed to fetch crews:", error)
        return { success: false, error: "Failed to fetch crews" }
    }
}

export async function createCrew(data: { name: string; foremanId: string; memberIds?: string[] }) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const crew = await prisma.crew.create({
            data: {
                name: data.name,
                foremanId: data.foremanId,
                members: {
                    create: data.memberIds?.map(id => ({
                        employeeId: id
                    })) || []
                }
            }
        })
        revalidatePath('/dashboard/labor') // Assuming crews are managed here for now
        revalidatePath('/dashboard/crews')
        return { success: true, data: crew }
    } catch (error) {
        console.error("Failed to create crew:", error)
        return { success: false, error: "Failed to create crew" }
    }
}

export async function updateCrew(id: string, data: { name?: string; foremanId?: string; memberIds?: string[] }) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        // If members are provided, we need to handle the relation update
        // This is a simple replace strategy for members
        const updateData: any = {
            name: data.name,
            foremanId: data.foremanId,
        }

        if (data.memberIds) {
            // First delete existing members
            await prisma.crewMember.deleteMany({
                where: { crewId: id }
            })

            // Then create new ones
            updateData.members = {
                create: data.memberIds.map(eid => ({
                    employeeId: eid
                }))
            }
        }

        const crew = await prisma.crew.update({
            where: { id },
            data: updateData
        })

        revalidatePath('/dashboard/labor')
        revalidatePath('/dashboard/crews')
        return { success: true, data: crew }
    } catch (error) {
        console.error("Failed to update crew:", error)
        return { success: false, error: "Failed to update crew" }
    }
}

export async function deleteCrew(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        await prisma.crew.delete({
            where: { id }
        })
        revalidatePath('/dashboard/labor')
        revalidatePath('/dashboard/crews')
        return { success: true }
    } catch (error) {
        console.error("Failed to delete crew:", error)
        return { success: false, error: "Failed to delete crew" }
    }
}

// Legacy dispatch function refactored to be more robust if needed, 
// or we can move the dispatch logic to a dedicated schedule action later.
// For now, keeping a basic version here.
export async function dispatchCrew(data: {
    crew: { id: string; role: string }[]; // Employee objects
    assets: string[];
    projectId: string;
}) {
    try {
        // This logic seems to have been creating a NEW crew every dispatch in the old code.
        // We should probably move away from that and use existing crews, 
        // but for backward compatibility with the "Dispatch" button logic:

        const foreman = data.crew.find(m => m.role === 'Foreman');
        if (!foreman) {
            return { success: false, error: "Crew must have a Foreman" };
        }

        const crewName = `Dispatch ${new Date().toLocaleDateString()}`;

        const newCrew = await prisma.crew.create({
            data: {
                name: crewName,
                foremanId: foreman.id!,
                members: {
                    create: data.crew.map(m => ({
                        employeeId: m.id,
                        role: m.role
                    }))
                }
            }
        });

        // Update Assets
        if (data.assets.length > 0) {
            await prisma.asset.updateMany({
                where: { id: { in: data.assets } },
                data: {
                    status: 'IN_USE',
                    location: 'On Site',
                }
            });
        }

        revalidatePath('/dashboard');
        return { success: true, data: newCrew };
    } catch (error) {
        console.error("Failed to dispatch crew:", error);
        return { success: false, error: "Failed to dispatch crew" };
    }
}
