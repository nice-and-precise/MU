'use server';

import { prisma } from "@/lib/prisma";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { format } from "date-fns";

export async function export216dPacket(projectId: string) {
    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                gsocTickets: {
                    include: {
                        whiteLining: true,
                        meetTicket: {
                            include: {
                                attendees: true
                            }
                        },
                        remarks: true,
                        damageEvents: true,
                    }
                },
                complianceEvents: {
                    orderBy: { timestamp: 'asc' },
                    include: {
                        createdBy: true
                    }
                }
            }
        });

        if (!project) throw new Error("Project not found");

        // Initialize PDF documents
        // formatting: a4, unit: mm
        const doc = new jsPDF();
        let yPos = 20;

        // --- Header ---
        doc.setFontSize(18);
        doc.text("216D Compliance Packet", 14, yPos);
        yPos += 10;

        doc.setFontSize(12);
        doc.text(`Project: ${project.name}`, 14, yPos);
        yPos += 7;
        doc.text(`Generated: ${format(new Date(), "PPpp")}`, 14, yPos);
        yPos += 15;

        // --- Tickets Section ---
        doc.setFontSize(14);
        doc.text("GSOC Tickets", 14, yPos);
        yPos += 5;

        const ticketData = project.gsocTickets.map(t => [
            t.ticketNumber,
            t.ticketType,
            t.status,
            format(new Date(t.filedAt), "PP")
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [['Ticket #', 'Type', 'Status', 'Filed Date']],
            body: ticketData,
            theme: 'striped',
        });

        // @ts-ignore
        yPos = doc.lastAutoTable.finalY + 15;

        // --- Detailed Evidence per Ticket ---
        for (const ticket of project.gsocTickets) {
            // Check page break
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(14);
            doc.text(`Ticket Details: ${ticket.ticketNumber}`, 14, yPos);
            yPos += 10;

            doc.setFontSize(10);
            doc.text(`Type: ${ticket.ticketType} | Status: ${ticket.status}`, 14, yPos);
            yPos += 10;

            if (ticket.whiteLining) {
                doc.setFontSize(12);
                doc.text("White Lining Evidence", 14, yPos);
                yPos += 7;

                doc.setFontSize(10);
                const desc = ticket.whiteLining.fieldDescription || "No description provided.";
                doc.text("Description:", 14, yPos);
                yPos += 5;
                const splitDesc = doc.splitTextToSize(desc, 180);
                doc.text(splitDesc, 14, yPos);
                yPos += (splitDesc.length * 5) + 5;

                // Photos
                if (ticket.whiteLining.photoUrls) {
                    let photos: string[] = [];
                    try {
                        const parsed = JSON.parse(ticket.whiteLining.photoUrls as string);
                        if (Array.isArray(parsed)) photos = parsed;
                    } catch (e) {
                        // fallback if not JSON (legacy?)
                        console.warn("Could not parse photo URLs");
                    }

                    if (photos.length > 0) {
                        doc.text(`Photos (${photos.length}):`, 14, yPos);
                        yPos += 10;

                        // Layout photos in a grid (2 per row for simplicity in PDF)
                        let xOffset = 14;
                        const imgWidth = 80;
                        const imgHeight = 60;

                        for (let i = 0; i < photos.length; i++) {
                            const photo = photos[i];
                            // Check vertical space
                            if (yPos + imgHeight > 280) {
                                doc.addPage();
                                yPos = 20;
                            }

                            try {
                                // Assume data URI
                                doc.addImage(photo, "JPEG", xOffset, yPos, imgWidth, imgHeight);
                            } catch (err) {
                                doc.text("[Error loading image]", xOffset, yPos + 20);
                            }

                            if (i % 2 === 0) {
                                xOffset += imgWidth + 10; // Move right
                            } else {
                                xOffset = 14; // Reset to left
                                yPos += imgHeight + 10; // Move down
                            }
                        }
                        // Ensure yPos is updated after loop if last row was incomplete or full
                        // If we ended on even index (0, 2..), we placed it left, next is right.
                        // We only incremented yPos when moving to next row.
                        // Let's just safeguard yPos to below the last image row.
                        if (photos.length % 2 !== 0) {
                            yPos += imgHeight + 10;
                        }
                    }
                }
                yPos += 10;
            }

            // Meet Ticket info
            if (ticket.meetTicket) {
                if (yPos > 250) { doc.addPage(); yPos = 20; }
                doc.setFontSize(12);
                doc.text("Meet Ticket Info", 14, yPos);
                yPos += 7;
                doc.setFontSize(10);
                const meetDate = ticket.meetTicket.meetScheduledFor ? new Date(ticket.meetTicket.meetScheduledFor) : new Date();
                doc.text(`Scheduled: ${format(meetDate, "PPpp")}`, 14, yPos);
                yPos += 5;
                doc.text(`Location: ${ticket.meetTicket.meetLocation || 'N/A'}`, 14, yPos);
                yPos += 5;
                doc.text(`Notes: ${ticket.meetTicket.agreementNotes || 'None'}`, 14, yPos);
                yPos += 10;

                if (ticket.meetTicket.attendees.length > 0) {
                    const attendees = ticket.meetTicket.attendees.map(a => `${a.name} (${a.company}) - ${a.role}`);
                    doc.text("Attendees: " + attendees.join(", "), 14, yPos);
                    yPos += 10;
                }
            }
        }

        // --- Compliance Log ---
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        doc.setFontSize(14);
        doc.text("Compliance Event Log", 14, yPos);
        yPos += 5;

        const eventData = project.complianceEvents.map(e => [
            format(new Date(e.timestamp), "PPpp"),
            e.eventType,
            e.details || '-',
            e.createdBy?.name || 'System'
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [['Time', 'Event', 'Details', 'User']],
            body: eventData,
            theme: 'grid',
            styles: { fontSize: 8 }
        });

        const pdfOutput = doc.output('datauristring');

        return {
            success: true,
            message: "Packet generated successfully",
            url: pdfOutput, // Return the Data URI directly
            filename: `Compliance_Packet_${project.id.slice(0, 8)}.pdf` // Suggest a filename
        };

    } catch (error) {
        console.error("PDF Generation Error:", error);
        throw new Error("Failed to generate compliance packet");
    }
}
