import { prisma } from '@/lib/prisma';
import { CompliancePacketData } from '@/lib/compliance/PacketGenerator';

export class ComplianceService {

    static async getComplianceData(ticketId: string): Promise<CompliancePacketData | null> {
        // Try to find GsocTicket first
        const ticket = await prisma.gsocTicket.findUnique({
            where: { id: ticketId },
            include: {
                project: true,
                whiteLining: true,
                complianceEvents: {
                    orderBy: { timestamp: 'asc' },
                    include: { createdBy: true }
                },
            },
        });

        if (!ticket) {
            console.error(`ComplianceService: Ticket ${ticketId} not found`);
            return null;
        }

        // Map to Packet Data
        return {
            meta: {
                generatedAt: new Date(),
                generatedBy: 'System', // Could inject user name if passed
            },
            ticket: {
                ticketNumber: ticket.ticketNumber,
                projectAddress: ticket.project.location || 'N/A',
                workStartDate: ticket.startTimeFromGsoc || ticket.filedAt,
                expirationDate: ticket.expirationAt || new Date(ticket.filedAt.getTime() + 14 * 24 * 60 * 60 * 1000), // Fallback 14 days
                legalStartDateTime: ticket.legalExcavationStartAt || new Date(ticket.filedAt.getTime() + 48 * 60 * 60 * 1000), // Fallback 48h
                excavatorName: ticket.project.customerName || 'Midwest Underground',
                ticketType: ticket.ticketType,
            },
            ewl: {
                geometryType: 'Polygon', // Simplification, fetching from whiteLining.locationGeometry if parsed
                description: ticket.whiteLining?.fieldDescription || 'No description provided.',
                isElectronicOnly: !ticket.whiteLining?.isOverMarked, // If NOT overmarked (painted), it's electronic only? Need to verify logic.
                // Logic: isElectronicOnly means NO PAINT. 
                // schema: isOverMarked default false. 
                // If isOverMarked is true, it means we marked it. 
                // So isElectronicOnly = !isOverMarked.
                photoUrls: ticket.whiteLining?.photoUrls ? JSON.parse(ticket.whiteLining.photoUrls) : [],
            },
            events: ticket.complianceEvents.map(e => ({
                eventId: e.id,
                timestamp: e.timestamp,
                user: e.createdBy?.name || 'System',
                action: e.eventType,
                details: e.details || '',
            })),
        };
    }

    /**
     * Bridges Ticket811 to GsocTicket if needed.
     * Often we might have a link via ticketNumber.
     */
    static async getComplianceDataByTicketNumber(ticketNumber: string): Promise<CompliancePacketData | null> {
        const ticket = await prisma.gsocTicket.findFirst({
            where: { ticketNumber },
        });
        if (!ticket) return null;
        return this.getComplianceData(ticket.id);
    }
}
