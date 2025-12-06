'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { authenticatedAction } from "@/lib/safe-action";
import {
    CreateGsocTicketSchema,
    CreateWhiteLiningSchema,
    CreateMeetTicketSchema,
    CreateLocateRemarkSchema,
    CreateDamageEventSchema
} from "@/schemas/compliance";

export const createGsocTicket = authenticatedAction(
    CreateGsocTicketSchema,
    async (data) => {
        const { projectId, ticketNumber, ticketType, filedAt, legalReady, legalExcavationStart } = data;

        const ticket = await prisma.gsocTicket.create({
            data: {
                projectId,
                ticketNumber,
                ticketType,
                filedAt: new Date(filedAt),
                legalLocateReadyAt: legalReady ? new Date(legalReady) : null,
                legalExcavationStartAt: legalExcavationStart ? new Date(legalExcavationStart) : null,
                startTimeFromGsoc: new Date(filedAt),
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
);

export const createWhiteLining = authenticatedAction(
    CreateWhiteLiningSchema,
    async (data, userId) => {
        const { projectId, ticketId, description, isOverMarked } = data;

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
                capturedByUserId: userId,
                fieldDescription: description,
                isOverMarked,
                photoUrls: JSON.stringify(data.photoUrls || []),
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
);

export const createMeetTicket = authenticatedAction(
    CreateMeetTicketSchema,
    async (data) => {
        const { projectId, ticketId, meetTime, excavationStart, location, attendees, notes } = data;

        const meet = await prisma.meetTicket.create({
            data: {
                ticketId,
                meetScheduledFor: new Date(meetTime),
                meetLocation: location || "",
                agreementNotes: notes || "",
                attendees: {
                    create: attendees?.map((a: any) => ({
                        name: a.name,
                        company: a.company,
                        role: a.role,
                        phone: a.phone,
                        email: a.email
                    })) || []
                }
            },
        });

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
                details: JSON.stringify({ meetTime, attendeeCount: attendees?.length || 0 }),
            },
        });

        revalidatePath(`/dashboard/projects/${projectId}`);
        return meet;
    }
);

export const createLocateRemark = authenticatedAction(
    CreateLocateRemarkSchema,
    async (data) => {
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
);

export const createDamageEvent = authenticatedAction(
    CreateDamageEventSchema,
    async (data) => {
        const { projectId, ticketId, facilityType, description, contactWasMade } = data;

        const damage = await prisma.damageEvent.create({
            data: {
                projectId,
                ticketId,
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
);
