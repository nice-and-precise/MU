import { prisma } from '@/lib/prisma';
import { CreateTicketSchema, UpdateTicketSchema, AddTicketResponseSchema, TicketFilterSchema } from '@/schemas/tickets';
import { z } from 'zod';

export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;
export type UpdateTicketInput = z.infer<typeof UpdateTicketSchema>;
export type AddTicketResponseInput = z.infer<typeof AddTicketResponseSchema>;
export type TicketFilterInput = z.infer<typeof TicketFilterSchema>;

export class TicketsService {

    static async createTicket(data: CreateTicketInput) {
        return await prisma.ticket811.create({
            data: {
                ...data,
                utilitiesNotified: data.utilitiesNotified || '[]',
                ...(data.projectId ? { projectId: data.projectId } : {}),
            } as any,
        });
    }

    static async getTickets(filter?: TicketFilterInput) {
        const where: any = {};
        if (filter?.status) where.status = filter.status;
        if (filter?.projectId) where.projectId = filter.projectId;

        return await prisma.ticket811.findMany({
            where,
            orderBy: { submittedAt: 'desc' },
            include: {
                responses: true,
            },
        });
    }

    static async updateTicket(id: string, data: UpdateTicketInput) {
        return await prisma.ticket811.update({
            where: { id },
            data: data as any,
        });
    }

    static async deleteTicket(id: string) {
        return await prisma.ticket811.delete({
            where: { id },
        });
    }

    static async addTicketResponse(ticketId: string, data: AddTicketResponseInput) {
        return await prisma.ticket811Response.create({
            data: {
                ticketId,
                ...data,
            },
        });
    }

    // --- Business Logic: Email Parsing ---

    static parseTicketEmail(emailBody: string) {
        const patterns = {
            ticketNumber: /TICKET NUMBER:?\s*(\d{8}-\d{6})/i,
            ticketType: /TICKET TYPE:\s*(.+)/i,
            submitted: /SUBMITTED:\s*(\d{2}\/\d{2}\/\d{4}\s+\d{1,2}:\d{2}\s+[AP]M)/i,
            workToBegin: /WORK TO BEGIN:\s*(\d{2}\/\d{2}\/\d{4}\s+\d{1,2}:\d{2}\s+[AP]M)/i,
            expires: /EXPIRES:\s*(\d{2}\/\d{2}\/\d{4}\s+\d{1,2}:\d{2}\s+[AP]M)/i,
            company: /COMPANY:\s*(.+)/i,
            caller: /CALLER:\s*(.+)/i,
            phone: /PHONE:\s*(.+)/i,
            workSite: /WORK SITE:\s*([\s\S]+?)(?=\n[A-Z][A-Z]+:|$)/i, // Capture everything until next header
            county: /County:\s*([^\n\r]+)|(\w+)\s+County/i,
            membersNotified: /MEMBERS NOTIFIED:\s*([\s\S]+)/i
        };

        const extract = (regex: RegExp) => {
            try {
                const match = emailBody.match(regex);
                return match ? (match[1] || match[2] || '').trim() : null;
            } catch (e) {
                console.error("Regex error:", e);
                return null;
            }
        };

        const parseDate = (dateStr: string | null) => {
            if (!dateStr) return new Date();
            return new Date(dateStr);
        };

        const ticketNumber = extract(patterns.ticketNumber);
        if (!ticketNumber) return null;

        // Special handling for County to avoid matching across lines
        let county = null;
        const countyMatch1 = emailBody.match(/County:\s*([^\n\r]+)/i);
        if (countyMatch1) {
            county = countyMatch1[1].trim();
        } else {
            const countyMatch2 = emailBody.match(/(\w+)\s+County/i);
            if (countyMatch2) {
                county = countyMatch2[1].trim();
            }
        }

        return {
            ticketNumber,
            type: extract(patterns.ticketType) || 'NORMAL',
            submittedAt: parseDate(extract(patterns.submitted)),
            workToBeginDate: parseDate(extract(patterns.workToBegin)),
            expirationDate: parseDate(extract(patterns.expires)),
            company: extract(patterns.company) || '',
            caller: extract(patterns.caller) || '',
            phone: extract(patterns.phone) || '',
            workSiteAddress: extract(patterns.workSite) || '',
            county: county || '',
            utilitiesNotified: extract(patterns.membersNotified) || '[]',
        };
    }
}

