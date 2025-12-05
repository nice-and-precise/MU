import { z } from 'zod';

// --- Types & Schemas ---

export const IticTicketStatusSchema = z.enum(['PENDING', 'PROCESSING', 'CLEARED', 'MARKED', 'CONFLICT', 'CANCELLED', 'EXPIRED']);
export type IticTicketStatus = z.infer<typeof IticTicketStatusSchema>;

export interface IticTicketRequest {
    excavatorId: string;
    workStartDate: Date;
    workEndDate?: Date;
    ticketType: 'NORMAL' | 'MEET' | 'EMERGENCY' | 'UPDATE';
    description: string;
    // Geometry can be passed as GeoJSON string or specific object
    geometry: string;
    streetAddress: string;
    city: string;
    county: string;
}

export interface IticTicketResult {
    success: boolean;
    ticketNumber?: string;
    errors?: string[];
    rawResponse?: any;
}

export interface MeetReportRequest {
    ticketNumber: string;
    meetDate: Date;
    attendees: string[];
    summary: string;
}

// --- Interface Definition ---

export interface IticClient {
    submitTicket(request: IticTicketRequest): Promise<IticTicketResult>;
    getTicketStatus(ticketNumber: string): Promise<IticTicketStatus>;
    submitMeetReport(report: MeetReportRequest): Promise<void>;
}

// --- Mock Implementation (Current Default) ---

export class MockIticClient implements IticClient {
    async submitTicket(request: IticTicketRequest): Promise<IticTicketResult> {
        console.log('[MockIticClient] Submitting ticket:', request);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Basic validation simulation
        if (!request.geometry) {
            return { success: false, errors: ['Missing geometry'] };
        }

        const mockId = `2026${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
        return {
            success: true,
            ticketNumber: mockId
        };
    }

    async getTicketStatus(ticketNumber: string): Promise<IticTicketStatus> {
        console.log('[MockIticClient] Checking status for:', ticketNumber);
        return 'PROCESSING';
    }

    async submitMeetReport(report: MeetReportRequest): Promise<void> {
        console.log('[MockIticClient] Submitting meet report:', report);
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

// --- Stubbed Real Implementation ---

export class StandardIticClient implements IticClient {
    private baseUrl: string;
    private apiKey: string;

    constructor(baseUrl: string, apiKey: string) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    async submitTicket(request: IticTicketRequest): Promise<IticTicketResult> {
        // TODO: Replace with real fetch call when API is documented
        throw new Error('Real ITIC integration not yet implemented. Use MockIticClient.');
    }

    async getTicketStatus(ticketNumber: string): Promise<IticTicketStatus> {
        // TODO: Implement polling
        throw new Error('Real ITIC integration not yet implemented.');
    }

    async submitMeetReport(report: MeetReportRequest): Promise<void> {
        // TODO: Implement meet report submission
        throw new Error('Real ITIC integration not yet implemented.');
    }
}

// --- Factory ---

export function getIticClient(): IticClient {
    const useReal = process.env.USE_REAL_ITIC_CLIENT === 'true';
    if (useReal) {
        return new StandardIticClient(
            process.env.ITIC_API_URL || '',
            process.env.ITIC_API_KEY || ''
        );
    }
    return new MockIticClient();
}
