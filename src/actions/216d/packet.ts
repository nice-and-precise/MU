'use server';

import { ComplianceService } from '@/services/compliance';
import { generateCompliancePacketPDF } from '@/lib/compliance/PacketGenerator';

export async function downloadCompliancePacket(ticketId: string): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
        const data = await ComplianceService.getComplianceData(ticketId);
        if (!data) {
            return { success: false, error: 'Compliance data not found for this ticket.' };
        }

        // Generate PDF Blob
        // Note: generateCompliancePacketPDF uses client-side fetch usually? 
        // Wait, jsPDF runs in Node? 
        // jsPDF is primarily for browser, but can run in Node with polyfills (atob, btoa, etc.)
        // However, standard jsPDF usage often fails in Server Components without 'window'.
        // We might need to keep the PDF generation CLIENT SIDE and just fetch the DATA here.
        // OR use a node-compatible pdf lib.

        // REVISION: Better pattern is:
        // 1. Server Action fetches DATA.
        // 2. Client Component calls Action -> gets Data -> calls generateCompliancePacketPDF (which runs in browser).
        // This avoids Node canvas dependencies.

        return { success: true, data: JSON.stringify(data) }; // Return data to client
    } catch (error) {
        console.error('Packet generation error:', error);
        return { success: false, error: 'Internal server error' };
    }
}
