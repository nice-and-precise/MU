'use client';

import { Ticket811, Ticket811Response } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { MapPin, Phone, Calendar, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { addTicketResponse } from '@/actions/tickets';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { checkTicketStatus } from '@/actions/tickets';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { WeatherWidget } from './WeatherWidget';

// Temporary interface to bypass stale Prisma types
interface ExtendedTicket {
    id: string;
    ticketNumber: string;
    type: string;
    status: string;
    expirationDate: Date | string;
    submittedAt: Date | string;
    workToBeginDate: Date | string;
    company: string;
    caller: string;
    phone: string;
    email?: string;
    workSiteAddress: string;
    city?: string;
    county?: string;
    nearestIntersection?: string;
    markingInstructions?: string;
    duration?: string;
    explosives?: boolean;
    tunneling?: boolean;
    mapLink?: string;
    responses: any[]; // Bypassing response type too
}

interface TicketDetailProps {
    ticket: any; // Cast to any initially to avoid prop mismatch
}

export default function TicketDetail({ ticket: rawTicket }: TicketDetailProps) {
    const ticket = rawTicket as ExtendedTicket;
    const [isAddingResponse, setIsAddingResponse] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const router = useRouter();

    const daysUntil = Math.ceil((new Date(ticket.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    // Ready to Dig Logic
    const hasResponses = ticket.responses && ticket.responses.length > 0;
    const allClear = hasResponses && ticket.responses.every((r: any) =>
        ['Marked', 'Clear', 'No Conflict'].includes(r.status)
    );
    const hasConflict = ticket.responses && ticket.responses.some((r: any) => r.status === 'Conflict');

    const handleAddResponse = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        await addTicketResponse({
            ticketId: ticket.id,
            data: {
                utilityName: formData.get('utilityName') as string,
                status: formData.get('status') as string,
                notes: formData.get('notes') as string,
            }
        });

        setLoading(false);
        setIsAddingResponse(false);
        router.refresh();
    };

    const handleCheckStatus = async () => {
        setCheckingStatus(true);
        try {
            const result = await checkTicketStatus(ticket.ticketNumber);
            if (result.success) {
                toast.success(`Status checked. Found ${result.data?.length} responses.`);
                router.refresh();
            } else {
                toast.error('Failed to check status');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setCheckingStatus(false);
        }
    };

    const handleAddToCalendar = () => {
        const start = new Date(ticket.workToBeginDate).toISOString().replace(/-|:|\.\d+/g, '');
        const end = new Date(new Date(ticket.workToBeginDate).getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, '');
        const details = `Ticket: ${ticket.ticketNumber}\nAddress: ${ticket.workSiteAddress}\nInstructions: ${ticket.markingInstructions}`;
        const url = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ADTSTART:${start}%0ADTEND:${end}%0ASUMMARY:811 Dig Start: ${ticket.ticketNumber}%0ADESCRIPTION:${encodeURIComponent(details)}%0ALOCATION:${encodeURIComponent(ticket.workSiteAddress)}%0AEND:VEVENT%0AEND:VCALENDAR`;

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `811-${ticket.ticketNumber}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">{ticket.ticketNumber}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{ticket.type}</Badge>
                        <Badge variant={ticket.status === 'ACTIVE' ? 'default' : 'secondary'}>{ticket.status}</Badge>
                        {ticket.status === 'ACTIVE' && (
                            <Badge variant={daysUntil <= 3 ? 'destructive' : 'outline'} className={daysUntil <= 3 ? '' : 'text-muted-foreground'}>
                                {daysUntil < 0 ? 'Expired' : `Expires in ${daysUntil} days`}
                            </Badge>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleCheckStatus}
                        disabled={checkingStatus}
                    >
                        {checkingStatus ? (
                            <>
                                <Clock className="mr-2 h-4 w-4 animate-spin" />
                                Checking GSOC...
                            </>
                        ) : (
                            'Check Status'
                        )}
                    </Button>
                    <Button variant="outline" onClick={handleAddToCalendar}>
                        <Calendar className="mr-2 h-4 w-4" /> Add to Cal
                    </Button>
                    {ticket.mapLink && (
                        <Button asChild variant="outline">
                            <a href={ticket.mapLink} target="_blank" rel="noopener noreferrer">
                                View on MapLINK
                            </a>
                        </Button>
                    )}
                </div>
            </div>

            {/* Ready to Dig Banner */}
            {hasResponses && (
                <div className={`p-4 rounded-lg border flex items-center gap-3 ${hasConflict ? 'bg-red-50 border-red-200 text-red-900' :
                    allClear ? 'bg-green-50 border-green-200 text-green-900' :
                        'bg-yellow-50 border-yellow-200 text-yellow-900'
                    }`}>
                    {hasConflict ? <XCircle className="h-6 w-6 text-red-600" /> :
                        allClear ? <CheckCircle className="h-6 w-6 text-green-600" /> :
                            <AlertTriangle className="h-6 w-6 text-yellow-600" />}

                    <div>
                        <h3 className="font-bold text-lg">
                            {hasConflict ? 'DO NOT DIG - CONFLICT REPORTED' :
                                allClear ? 'READY TO DIG' :
                                    'PENDING UTILITY RESPONSES'}
                        </h3>
                        <p className="text-sm opacity-90">
                            {hasConflict ? 'One or more utilities have reported a conflict. Contact them immediately.' :
                                allClear ? 'All notified utilities have responded with Clear or Marked status. Proceed with caution.' :
                                    'Waiting for all utilities to respond. Do not excavate until all clear.'}
                        </p>
                    </div>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {/* Location & Work Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" /> Location & Work
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="font-semibold">Address</div>
                            <div>{ticket.workSiteAddress}</div>
                            <div className="text-muted-foreground">{ticket.city}, {ticket.county}</div>
                        </div>
                        {ticket.nearestIntersection && (
                            <div>
                                <div className="font-semibold">Nearest Intersection</div>
                                <div>{ticket.nearestIntersection}</div>
                            </div>
                        )}
                        <div>
                            <div className="font-semibold">Marking Instructions</div>
                            <div className="whitespace-pre-wrap text-sm bg-muted p-2 rounded">{ticket.markingInstructions}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="font-semibold">Explosives</div>
                                <div>{ticket.explosives ? 'Yes' : 'No'}</div>
                            </div>
                            <div>
                                <div className="font-semibold">Tunneling</div>
                                <div>{ticket.tunneling ? 'Yes' : 'No'}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Dates & Contact */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" /> Schedule & Contact
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="font-semibold text-muted-foreground text-sm">Submitted</div>
                                <div>{format(new Date(ticket.submittedAt), 'PP p')}</div>
                            </div>
                            <div>
                                <div className="font-semibold text-muted-foreground text-sm">Work Starts</div>
                                <div>{format(new Date(ticket.workToBeginDate), 'PP p')}</div>
                            </div>
                            <div>
                                <div className="font-semibold text-muted-foreground text-sm">Expires</div>
                                <div className={daysUntil <= 3 ? 'text-red-500 font-bold' : ''}>
                                    {format(new Date(ticket.expirationDate), 'PP p')}
                                </div>
                            </div>
                            <div>
                                <div className="font-semibold text-muted-foreground text-sm">Duration</div>
                                <div>{ticket.duration}</div>
                            </div>
                        </div>

                        <WeatherWidget address={ticket.workSiteAddress} date={ticket.workToBeginDate} />

                        <div className="border-t pt-4">
                            <div className="font-semibold mb-2 flex items-center gap-2"><Phone className="h-4 w-4" /> Contact</div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>Company:</div>
                                <div>{ticket.company}</div>
                                <div>Caller:</div>
                                <div>{ticket.caller}</div>
                                <div>Phone:</div>
                                <div>{ticket.phone}</div>
                                {ticket.email && (
                                    <>
                                        <div>Email:</div>
                                        <div>{ticket.email}</div>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Utilities & Responses */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Utility Responses</CardTitle>
                    <Button size="sm" onClick={() => setIsAddingResponse(!isAddingResponse)}>
                        {isAddingResponse ? 'Cancel' : 'Add Response'}
                    </Button>
                </CardHeader>
                <CardContent>
                    {isAddingResponse && (
                        <form onSubmit={handleAddResponse} className="mb-6 p-4 border rounded-lg bg-muted/50 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Utility Name</Label>
                                    <Input name="utilityName" required placeholder="e.g. Xcel Energy" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select name="status" defaultValue="Marked">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Marked">Marked</SelectItem>
                                            <SelectItem value="Clear">Clear / No Conflict</SelectItem>
                                            <SelectItem value="Conflict">Conflict</SelectItem>
                                            <SelectItem value="Not Responded">Not Responded</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Notes</Label>
                                <Textarea name="notes" placeholder="Details about marks..." />
                            </div>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Response'}
                            </Button>
                        </form>
                    )}

                    <div className="space-y-4">
                        {ticket.responses.length === 0 ? (
                            <div className="text-center text-muted-foreground py-4">No responses recorded yet.</div>
                        ) : (
                            ticket.responses.map((response) => (
                                <div key={response.id} className="flex items-start justify-between p-4 border rounded-lg">
                                    <div>
                                        <div className="font-semibold">{response.utilityName}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {response.responseDate ? format(new Date(response.responseDate), 'PP') : 'No date'}
                                        </div>
                                        {response.notes && <div className="mt-2 text-sm">{response.notes}</div>}
                                    </div>
                                    <Badge variant={
                                        response.status === 'Marked' ? 'default' :
                                            response.status === 'Clear' ? 'secondary' :
                                                'destructive'
                                    }>
                                        {response.status}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
