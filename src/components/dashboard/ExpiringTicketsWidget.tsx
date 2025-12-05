'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getTickets } from '@/actions/tickets';

// Temporary interface to match what we expect from the API/Action
// mirroring the structure in TicketDetail for consistency
interface WidgetTicket {
    id: string;
    ticketNumber: string;
    expirationDate: Date | string;
    status: string;
    workSiteAddress: string;
}

export function ExpiringTicketsWidget() {
    const [tickets, setTickets] = useState<WidgetTicket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExpiring = async () => {
            try {
                // Fetch all active tickets and filter client-side for now 
                // (or update getTickets to support date filtering later)
                const result = await getTickets(undefined);
                if (result.success && result.data) {
                    const now = new Date();
                    const threeDaysFromNow = new Date();
                    threeDaysFromNow.setDate(now.getDate() + 3);

                    const expiring = (result.data as any[]).filter((t: any) => {
                        const expDate = new Date(t.expirationDate);
                        return t.status === 'ACTIVE' && expDate <= threeDaysFromNow;
                    }).sort((a: any, b: any) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime())
                        .slice(0, 5); // Show top 5

                    setTickets(expiring);
                }
            } catch (error) {
                console.error('Failed to fetch expiring tickets', error);
            } finally {
                setLoading(false);
            }
        };

        fetchExpiring();
    }, []);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Expiring 811 Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-12 bg-muted animate-pulse rounded-md" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Expiring Soon
                </CardTitle>
                <Badge variant={tickets.length > 0 ? "destructive" : "secondary"}>
                    {tickets.length}
                </Badge>
            </CardHeader>
            <CardContent>
                {tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                        <CheckCircle className="h-8 w-8 mb-2 text-green-500" />
                        <p>No tickets expiring soon.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tickets.map((ticket) => {
                            const daysLeft = Math.ceil((new Date(ticket.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            return (
                                <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                                    <div className="space-y-1">
                                        <div className="font-semibold text-sm">{ticket.ticketNumber}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                                            {ticket.workSiteAddress}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={`text-xs font-bold ${daysLeft < 0 ? 'text-red-600' : 'text-amber-600'}`}>
                                            {daysLeft < 0 ? 'Expired' : `${daysLeft} days`}
                                        </div>
                                        <Button asChild size="sm" variant="ghost" className="h-8 w-8 p-0">
                                            <Link href={`/811/${ticket.id}`}>
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                <div className="mt-4 pt-4 border-t">
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/811">View All Tickets</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
