import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { generateExpirationEmailHtml } from '@/components/emails/ExpirationEmail';
import { addDays, differenceInDays, startOfDay } from 'date-fns';

export async function GET() {
    try {
        console.log('Starting 811 expiration check...');

        const now = new Date();
        const threeDaysFromNow = addDays(now, 3);

        // Find tickets expiring within the next 3 days that are still active
        const expiringTickets = await prisma.ticket811.findMany({
            where: {
                status: 'ACTIVE',
                expirationDate: {
                    lte: threeDaysFromNow,
                    gte: startOfDay(now), // Don't re-notify for old expired ones unless we want to
                },
            },
            include: {
                project: {
                    include: {
                        createdBy: true, // Get project creator email
                    }
                }
            }
        });

        const results = [];

        for (const ticket of expiringTickets) {
            const daysUntil = differenceInDays(new Date(ticket.expirationDate), now);

            // Determine recipient: Project creator or fallback
            const recipientEmail = ticket.project?.createdBy?.email || 'admin@example.com'; // TODO: Configure fallback

            const emailHtml = generateExpirationEmailHtml({
                ticketNumber: ticket.ticketNumber,
                expirationDate: ticket.expirationDate.toLocaleDateString(),
                daysUntil,
                workSiteAddress: ticket.workSiteAddress || ticket.project?.location || 'Unknown Location',
                ticketUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/811/tickets/${ticket.id}`
            });

            const emailResult = await sendEmail({
                to: recipientEmail,
                subject: `URGENT: 811 Ticket Expiring in ${daysUntil} Days`,
                html: emailHtml
            });

            results.push({
                ticket: ticket.ticketNumber,
                recipient: recipientEmail,
                sent: emailResult.success,
                daysUntil
            });

            // Optionally update ticket status if it's already expired (daysUntil < 0)
            if (daysUntil < 0) {
                await prisma.ticket811.update({
                    where: { id: ticket.id },
                    data: { status: 'EXPIRED' }
                });
            }
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            details: results
        });

    } catch (error) {
        console.error('Expiration check failed:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
