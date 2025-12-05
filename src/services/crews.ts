import { prisma } from '@/lib/prisma';

export const CrewService = {
    getCrews: async () => {
        return await prisma.crew.findMany({
            include: {
                foreman: true,
                members: {
                    include: {
                        employee: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });
    },

    createCrew: async (data: { name: string; foremanId: string; memberIds?: string[] }) => {
        return await prisma.crew.create({
            data: {
                name: data.name,
                foremanId: data.foremanId,
                members: {
                    create: data.memberIds?.map(id => ({
                        employeeId: id
                    })) || []
                }
            }
        });
    },

    updateCrew: async (id: string, data: { name?: string; foremanId?: string; memberIds?: string[] }) => {
        // Prepare update data
        const updateData: any = {};
        if (data.name) updateData.name = data.name;
        if (data.foremanId) updateData.foremanId = data.foremanId;

        if (data.memberIds) {
            // First delete existing members
            await prisma.crewMember.deleteMany({
                where: { crewId: id }
            });

            // Then create new ones
            updateData.members = {
                create: data.memberIds.map(eid => ({
                    employeeId: eid
                }))
            };
        }

        return await prisma.crew.update({
            where: { id },
            data: updateData
        });
    },

    deleteCrew: async (id: string) => {
        return await prisma.crew.delete({
            where: { id }
        });
    },

    dispatchCrew: async (data: {
        crew: { id: string; role: string }[];
        assets: string[];
        projectId: string;
    }) => {
        const foreman = data.crew.find(m => m.role === 'Foreman');
        if (!foreman) {
            throw new Error("Crew must have a Foreman");
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

        return newCrew;
    }
};
