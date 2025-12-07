'use server';

import { authenticatedAction } from "@/lib/safe-action";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const getAuditLogs = authenticatedAction(
    z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
    }),
    async ({ limit, offset }, userId) => {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user || !['OWNER', 'SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
            throw new Error("Unauthorized: Insufficient permissions.");
        }

        const logs = await prisma.auditEvent.findMany({
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' },
            include: {
                actor: {
                    select: {
                        name: true,
                        email: true,
                        role: true
                    }
                }
            }
        });

        return logs;
    }
);
