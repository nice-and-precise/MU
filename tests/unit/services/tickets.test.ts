import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TicketsService } from '@/services/tickets';
import { prisma } from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        ticket811: {
            create: vi.fn(),
            findMany: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        ticket811Response: {
            create: vi.fn(),
        }
    }
}));

describe('TicketsService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createTicket', () => {
        it('should create a ticket with default values', async () => {
            const input = {
                ticketNumber: '12345678-000001',
                expirationDate: new Date(),
                type: 'NORMAL',
                status: 'ACTIVE' as const,
                utilitiesNotified: '[]',
            };

            (prisma.ticket811.create as any).mockResolvedValue({ id: '1', ...input });

            await TicketsService.createTicket(input);

            expect(prisma.ticket811.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    ticketNumber: '12345678-000001',
                    utilitiesNotified: '[]',
                })
            });
        });
    });

    describe('parseTicketEmail', () => {
        it('should parse a valid ticket email', () => {
            const emailBody = `
TICKET NUMBER: 24000000-000001
TICKET TYPE: NORMAL
SUBMITTED: 05/01/2024 08:00 AM
WORK TO BEGIN: 05/03/2024 08:00 AM
EXPIRES: 05/20/2024 08:00 AM
COMPANY: ACME Construction
CALLER: John Doe
PHONE: 555-0100
WORK SITE:
123 Main St
Minneapolis, MN 55401
County: Hennepin
MEMBERS NOTIFIED:
Xcel Energy
CenterPoint Energy

View Ticket
            `.replace(/^\s+/gm, '');

            const result = TicketsService.parseTicketEmail(emailBody);
            console.log("Parsed Result JSON:", JSON.stringify(result, null, 2));

            expect(result).not.toBeNull();
            expect(result?.ticketNumber).toBe('24000000-000001');
            expect(result?.type).toBe('NORMAL');
            expect(result?.company).toBe('ACME Construction');
            expect(result?.caller).toBe('John Doe');
            expect(result?.phone).toBe('555-0100');
            expect(result?.county).toBe('Hennepin');
            expect(result?.utilitiesNotified).toMatch(/Xcel Energy/);
            expect(result?.utilitiesNotified).toMatch(/CenterPoint Energy/);
        });

        it('should return null for invalid email', () => {
            const result = TicketsService.parseTicketEmail('Invalid Email Body');
            expect(result).toBeNull();
        });
    });
});
