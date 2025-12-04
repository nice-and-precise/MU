
export interface ITICnxtTicketPayload {
    excavatorId: string;
    workDate: Date;
    coordinates: string; // GeoJSON string
    ticketType: string;
    description: string;
}

export interface ITICnxtResponse {
    success: boolean;
    ticketNumber?: string;
    message?: string;
    errors?: string[];
}

/**
 * Simulates the ITICnxt API Client
 */
export class ITICnxtClient {
    private apiKey: string;
    private baseUrl: string;

    constructor() {
        this.apiKey = process.env.ITICNXT_API_KEY || 'mock-key';
        this.baseUrl = process.env.ITICNXT_API_URL || 'https://sandbox.itic.occinc.com/api/v1';
    }

    async submitTicket(payload: ITICnxtTicketPayload): Promise<ITICnxtResponse> {
        console.log('Submitting ticket to ITICnxt:', payload);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simulate validation
        if (!payload.coordinates) {
            return {
                success: false,
                errors: ['Missing coordinates']
            };
        }

        // Simulate success
        const mockTicketNumber = `2026${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

        return {
            success: true,
            ticketNumber: mockTicketNumber,
            message: 'Ticket submitted successfully to ITICnxt Sandbox.'
        };
    }

    async checkStatus(ticketNumber: string): Promise<string> {
        // Simulate status check
        return 'PROCESSING';
    }
}
