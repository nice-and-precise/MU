import { prisma } from '@/lib/prisma';

export class UserService {
    static async getUserPreferences(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { preferences: true }
        });
        return user?.preferences ? JSON.parse(user.preferences) : {};
    }

    static async updateUserPreferences(userId: string, preferences: any) {
        return await prisma.user.update({
            where: { id: userId },
            data: {
                preferences: JSON.stringify(preferences)
            },
            select: { preferences: true }
        });
    }
}
