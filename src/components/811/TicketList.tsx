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
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { ExternalLink, Eye, CheckSquare } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

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
            <div className="rounded-md border">
                {/* Desktop Table View */}
                <div className="hidden md:block">
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
                                    <TableCell colSpan={7} className="py-8">
                                        <EmptyState
                                            title="No tickets found"
                                            description="Create a new ticket to get started with 811 requests."
                                            actionLabel="Create Ticket"
                                            actionHref="/811/new"
                                            icon={CheckSquare}
                                        />
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
                                                <StatusBadge status={ticket.status} />
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
                                                    <Button variant="ghost" size="icon" asChild aria-label="View Ticket Details">
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

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4 p-4 bg-gray-50 dark:bg-gray-900">
                    {tickets.length === 0 ? (
                        <EmptyState
                            title="No tickets found"
                            description="Create a new ticket to get started."
                            actionLabel="Create Ticket"
                            actionHref="/811/new"
                            icon={CheckSquare}
                        />
                    ) : (
                        tickets.map((ticket) => {
                            const daysUntil = Math.ceil((new Date(ticket.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            return (
                                <div key={ticket.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-bold text-lg text-blue-600">#{ticket.ticketNumber}</div>
                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{ticket.type}</div>
                                        </div>
                                        <StatusBadge status={ticket.status} />
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <p className="line-clamp-2">{ticket.workSiteAddress}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                        <div>
                                            <span className="block font-semibold">Start:</span>
                                            {format(new Date(ticket.workToBeginDate), 'MMM d')}
                                        </div>
                                        <div>
                                            <span className="block font-semibold">Expires:</span>
                                            <span className={daysUntil <= 3 ? 'text-red-500 font-bold' : ''}>
                                                {format(new Date(ticket.expirationDate), 'MMM d')} ({daysUntil}d)
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                        {ticket.mapLink && (
                                            <Button variant="outline" size="sm" asChild className="h-8">
                                                <a href={ticket.mapLink} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-3 w-3 mr-1" /> Map
                                                </a>
                                            </Button>
                                        )}
                                        <Button size="sm" asChild className="h-8 bg-blue-600 hover:bg-blue-700">
                                            <Link href={`/811/${ticket.id}`}>
                                                <Eye className="h-3 w-3 mr-1" /> View
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
