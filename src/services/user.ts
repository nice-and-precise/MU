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

    static async getFavorites(userId: string): Promise<string[]> {
        const prefs = await this.getUserPreferences(userId);
        return prefs.favorites || [];
    }

    static async toggleFavorite(userId: string, href: string): Promise<string[]> {
        const currentFavorites = await this.getFavorites(userId);
        let newFavorites = [...currentFavorites];

        if (newFavorites.includes(href)) {
            newFavorites = newFavorites.filter(f => f !== href);
        } else {
            // Limit to 5 favorites
            if (newFavorites.length >= 5) {
                throw new Error("Maximum of 5 favorites allowed");
            }
            newFavorites.push(href);
        }

        await this.updateUserPreferences(userId, {
            preferences: {
                ...(await this.getUserPreferences(userId)),
                favorites: newFavorites
            }
        });

        return newFavorites;
    }
}
