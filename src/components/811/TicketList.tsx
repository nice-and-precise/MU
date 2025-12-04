'use client';

import { Ticket811, Ticket811Response } from '@prisma/client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { ExternalLink, Eye } from 'lucide-react';

type TicketWithResponses = Ticket811 & {
    responses: Ticket811Response[];
};

interface TicketListProps {
    tickets: TicketWithResponses[];
}

export default function TicketList({ tickets }: TicketListProps) {
    const getStatusColor = (status: string, expirationDate: Date) => {
        if (status !== 'ACTIVE') return 'secondary';
        const days = Math.ceil((new Date(expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (days < 0) return 'destructive';
        if (days <= 3) return 'warning'; // You might need to define a warning variant or use style
        return 'default';
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Ticket #</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Work Site</TableHead>
                        <TableHead>Work Start</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tickets.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                No tickets found. Create one to get started.
                            </TableCell>
                        </TableRow>
                    ) : (
                        tickets.map((ticket) => {
                            const daysUntil = Math.ceil((new Date(ticket.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                            return (
                                <TableRow key={ticket.id}>
                                    <TableCell className="font-medium">{ticket.ticketNumber}</TableCell>
                                    <TableCell>{ticket.type}</TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={ticket.workSiteAddress}>
                                        {ticket.workSiteAddress}
                                    </TableCell>
                                    <TableCell>{format(new Date(ticket.workToBeginDate), 'MMM d, yyyy')}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{format(new Date(ticket.expirationDate), 'MMM d, yyyy')}</span>
                                            {ticket.status === 'ACTIVE' && (
                                                <span className={`text-xs ${daysUntil <= 3 ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                                                    {daysUntil < 0 ? 'Expired' : `${daysUntil} days left`}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={ticket.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                            {ticket.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {ticket.mapLink && (
                                                <Button variant="ghost" size="icon" asChild title="View Map">
                                                    <a href={ticket.mapLink} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/811/${ticket.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
