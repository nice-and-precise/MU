
import { prisma } from '@/lib/prisma';
import { AuditAction } from '@prisma/client';

export class AuditService {
    static async log(
        action: AuditAction,
        entityType: string,
        entityId: string,
        actorId: string,
        metadata?: Record<string, any>
    ) {
        try {
            return await prisma.auditEvent.create({
                data: {
                    action,
                    entityType,
                    entityId,
                    actorId,
                    metadata: metadata ? JSON.stringify(metadata) : undefined
                }
            });
        } catch (error) {
            console.error("Failed to log audit event:", error);
            // Silent failure to avoid blocking main flow
        }
    }

    static async getHistory(entityType: string, entityId: string) {
        return await prisma.auditEvent.findMany({
            where: { entityType, entityId },
            orderBy: { createdAt: 'desc' },
            include: {
                actor: {
                    select: { name: true, email: true, role: true }
                }
            }
        });
    }

    static async getUserHistory(actorId: string) {
        return await prisma.auditEvent.findMany({
            where: { actorId },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
    }
}
