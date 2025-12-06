import { describe, it, expect, vi, beforeEach } from 'vitest';
import { export216dPacket } from '@/actions/216d/export';
import { prisma } from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        project: {
            findUnique: vi.fn(),
        }
    }
}));

describe('export216dPacket', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should generate a PDF data URI for a valid project', async () => {
        // Mock data
        const mockProject = {
            id: 'proj-123',
            name: 'Test Project',
            gsocTickets: [
                {
                    id: 'ticket-1',
                    ticketNumber: '2501010001',
                    ticketType: 'NORMAL',
                    status: 'SUBMITTED',
                    filedAt: new Date(),
                    whiteLining: {
                        fieldDescription: 'Test excavation',
                        photoUrls: '["data:image/jpeg;base64,/9j/4AAQSw..."]' // Mimic DB string
                    },
                    meetTicket: {
                        meetScheduledFor: new Date(),
                        meetLocation: 'On site',
                        agreementNotes: 'Notes',
                        attendees: [{ name: 'John', company: 'Acme', role: 'EXCAVATOR' }]
                    },
                    remarks: [],
                    damageEvents: []
                }
            ],
            complianceEvents: [
                {
                    timestamp: new Date(),
                    eventType: 'TICKET_FILED',
                    details: 'Details',
                    createdBy: { name: 'User' }
                }
            ]
        };

        (prisma.project.findUnique as any).mockResolvedValue(mockProject);

        const result = await export216dPacket('proj-123');

        expect(result.success).toBe(true);
        expect(result.filename).toBeDefined();
        // Check for PDF signature in base64. 
        // Data URI: "data:application/pdf;base64,JVBER..."
        // %PDF header in hex is 25 50 44 46, in base64 "JVBER"
        // But jsPDF output('datauristring') might vary slightly in MIME type string.
        expect(result.url).toMatch(/^data:application\/pdf;filename=generated.pdf;base64,/); // jsPDF sometimes puts filename in data URI or just data:application/pdf;base64,
        // Actually, jsPDF output('datauristring') usually returns "data:application/pdf;filename=generated.pdf;base64,..." or similar if filename is passed, or standard one.
        // Let's just check it starts with data:application/pdf
        expect(result.url).toContain('data:application/pdf');
    });

    it('should throw error if project not found', async () => {
        (prisma.project.findUnique as any).mockResolvedValue(null);

        await expect(export216dPacket('invalid')).rejects.toThrow('Failed to generate compliance packet');
    });
});
