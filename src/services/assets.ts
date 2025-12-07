import { prisma } from '@/lib/prisma';
import { CreateAssetInput, UpdateAssetInput } from '@/schemas/assets';

export class AssetService {
    static async getAssets() {
        return await prisma.asset.findMany({
            orderBy: { updatedAt: 'desc' },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                inspections: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: {
                        id: true,
                        createdAt: true,
                        passed: true,
                        type: true,
                        createdById: true
                    }
                }
            },
        });
    }

    static async createAsset(data: CreateAssetInput) {
        // Need to cast or transform because Zod output is what we want for Prisma, but input allows strings/nulls.
        // Actually, Prisma create expects the resolved types (Date, etc).
        // The authenticatedAction passes the OUTPUT of schema parse (validation.data) to the handler.
        // So the handler receives Date objects.
        // But `CreateAssetInput` type here is `z.input`.
        // I should probably use `z.output` for the service method argument if it's called from action.
        // Or just `any` or `Prisma.AssetCreateInput`.
        // I'll use `any` for simplicity here as Zod guarantees structure.
        return await prisma.asset.create({
            data: data as any,
        });
    }

    static async updateAsset(id: string, data: UpdateAssetInput) {
        return await prisma.asset.update({
            where: { id },
            data: data as any,
        });
    }

    static async deleteAsset(id: string) {
        return await prisma.asset.delete({
            where: { id },
        });
    }
}
