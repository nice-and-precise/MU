'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createGsocTicket(data: any) {
    const { projectId, ticketNumber, ticketType, filedAt, legalReady, legalExcavationStart } = data;

    const ticket = await prisma.gsocTicket.create({
        data: {
            projectId,
            ticketNumber,
            ticketType,
            filedAt: new Date(filedAt),
            legalLocateReadyAt: legalReady ? new Date(legalReady) : null,
            legalExcavationStartAt: legalExcavationStart ? new Date(legalExcavationStart) : null,
            startTimeFromGsoc: new Date(filedAt), // Assuming start time is same as filed for now, or passed in
            status: "SUBMITTED",
        },
    });

    await prisma.complianceEvent.create({
        data: {
            projectId,
            ticketId: ticket.id,
            eventType: "TICKET_FILED",
            details: JSON.stringify({ ticketNumber, ticketType }),
        },
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
    return ticket;
}

export async function createWhiteLining(data: any) {
    const { projectId, ticketId, description, isOverMarked, userId } = data;

    // If no ticketId, we might need to create a placeholder or link later. 
    // For now assume we have a ticket or we create a "DRAFT" ticket if needed.
    // But White Lining usually happens BEFORE ticket.
    // So we might need to store it linked to Project first? 
    // The schema links it to GsocTicket.
    // So we might need to create a Draft ticket.

    let tid = ticketId;
    if (!tid) {
        const ticket = await prisma.gsocTicket.create({
            data: {
                projectId,
                ticketNumber: "PENDING-" + Date.now(),
                ticketType: "NORMAL",
                filedAt: new Date(),
                startTimeFromGsoc: new Date(),
                status: "DRAFT",
            },
        });
        tid = ticket.id;
    }

    const snapshot = await prisma.whiteLiningSnapshot.create({
        data: {
            ticketId: tid,
            capturedByUserId: userId, // We need a real user ID
            fieldDescription: description,
            isOverMarked,
            // photoUrls would be handled by upload
        },
    });

    await prisma.complianceEvent.create({
        data: {
            projectId,
            ticketId: tid,
            eventType: "WHITE_LINING_CAPTURED",
            createdById: userId,
        },
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
    return snapshot;
}

export async function createMeetTicket(data: any) {
    const { projectId, ticketId, meetTime, excavationStart } = data;

    const meet = await prisma.meetTicket.create({
        data: {
            ticketId,
            meetScheduledFor: new Date(meetTime),
            // other fields
        },
    });

    // Update ticket with legal start
    await prisma.gsocTicket.update({
        where: { id: ticketId },
        data: {
            legalExcavationStartAt: new Date(excavationStart),
            ticketType: "MEET",
        },
    });

    await prisma.complianceEvent.create({
        data: {
            projectId,
            ticketId,
            eventType: "MEET_SCHEDULED",
            details: JSON.stringify({ meetTime }),
        },
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
    return meet;
}

export async function createLocateRemark(data: any) {
    const { projectId, ticketId, type, reason, notes } = data;

    const remark = await prisma.locateRemark.create({
        data: {
            ticketId,
            type,
            reason,
            notes,
        },
    });

    await prisma.complianceEvent.create({
        data: {
            projectId,
            ticketId,
            eventType: "REMARK_REQUESTED",
            details: JSON.stringify({ type, reason }),
        },
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
    return remark;
}

export async function createDamageEvent(data: any) {
    const { projectId, ticketId, facilityType, description, contactWasMade } = data;

    const damage = await prisma.damageEvent.create({
        data: {
            projectId,
            ticketId, // Optional
            facilityType,
            description,
            contactWasMade,
            occurredAt: new Date(),
        },
    });

    await prisma.complianceEvent.create({
        data: {
            projectId,
            ticketId,
            eventType: "DAMAGE_REPORTED",
            details: JSON.stringify({ facilityType, description }),
        },
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
    return damage;
}
