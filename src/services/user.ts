import { prisma } from '@/lib/prisma';

export class UserService {
    static async getUserPreferences(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { preferences: true, phone: true }
        });
        return {
            phone: user?.phone,
            ...(user?.preferences ? JSON.parse(user.preferences) : {})
        };
    }

    static async updateUserPreferences(userId: string, data: { phone?: string, preferences?: any }) {
        const { phone, preferences } = data;

        return await prisma.user.update({
            where: { id: userId },
            data: {
                ...(phone !== undefined && { phone }),
                ...(preferences && { preferences: JSON.stringify(preferences) })
            },
            select: { preferences: true, phone: true }
        });
    }
}
