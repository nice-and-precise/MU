import { z } from 'zod';

export const CreateGsocTicketSchema = z.object({
    projectId: z.string().min(1),
    ticketNumber: z.string().min(1, "Ticket number is required"),
    ticketType: z.string().min(1), // Should ideally be enum, but string matches DB for now
    filedAt: z.string().or(z.date()), // Accepts ISO string or Date
    legalReady: z.string().or(z.date()).optional().nullable(),
    legalExcavationStart: z.string().or(z.date()).optional().nullable(),
});

export const CreateWhiteLiningSchema = z.object({
    projectId: z.string().min(1),
    ticketId: z.string().optional(), // Can be null/undefined if creating drafted ticket
    description: z.string().min(1, "Description is required"),
    isOverMarked: z.boolean().default(false),
    photoUrls: z.array(z.string()).optional().default([]),
});

export const MeetAttendeeSchema = z.object({
    name: z.string().min(1),
    company: z.string().optional(),
    role: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
});

export const CreateMeetTicketSchema = z.object({
    projectId: z.string().min(1),
    ticketId: z.string().min(1),
    meetTime: z.string().or(z.date()),
    excavationStart: z.string().or(z.date()),
    location: z.string().optional(),
    notes: z.string().optional(),
    attendees: z.array(MeetAttendeeSchema).optional(),
});

export const CreateLocateRemarkSchema = z.object({
    projectId: z.string().min(1),
    ticketId: z.string().min(1),
    type: z.string(),
    reason: z.string().optional(),
    notes: z.string().optional(),
});

export const CreateDamageEventSchema = z.object({
    projectId: z.string().min(1),
    ticketId: z.string().optional(),
    facilityType: z.string(),
    description: z.string().min(1),
    contactWasMade: z.boolean(),
});

export const SubmitTicketToIticSchema = z.object({
    ticketId: z.string().min(1),
    projectId: z.string().min(1),
});

export const SubmitMeetDocumentationSchema = z.object({
    meetTicketId: z.string().min(1),
    projectId: z.string().min(1),
});
