"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BigButton } from "@/components/ui/BigButton";
import { TicketTimer } from "@/components/safety/TicketTimer";
import { Plus, FileText, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createTicket, getTickets } from "@/actions/tickets";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Ticket {
    id: string;
    number: string;
    project: string;
    expiration: string;
    status: string;
}

interface TicketManagerProps {
    projectId: string;
    initialTickets?: Ticket[];
}

export function TicketManager({ projectId, initialTickets = [] }: TicketManagerProps) {
    const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // New Ticket Form State
    const [newTicketNumber, setNewTicketNumber] = useState("");
    const [expirationDate, setExpirationDate] = useState("");

    useEffect(() => {
        // Refresh tickets if needed, but we rely on initialTickets mostly
    }, [projectId]);

    const handleCreateTicket = async () => {
        if (!newTicketNumber || !expirationDate) return;
        setLoading(true);

        const res = await createTicket({
            projectId,
            ticketNumber: newTicketNumber,
            ticketDate: new Date(), // Assuming today is start date
            expirationDate: new Date(expirationDate)
        });

        if (res.success) {
            toast.success("Ticket Created");
            setIsDialogOpen(false);
            setNewTicketNumber("");
            setExpirationDate("");
            // Refresh list
            const updated = await getTickets(projectId);
            setTickets(updated);
        } else {
            toast.error("Failed to create ticket");
        }
        setLoading(false);
    };

    const filteredTickets = tickets.filter(t =>
        t.number.includes(searchTerm) || (t.project && t.project.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="border-b bg-slate-50">
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-orange-600" />
                        811 Ticket Management
                    </CardTitle>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="h-8 text-xs"><Plus className="w-3 h-3 mr-1" /> NEW TICKET</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New 811 Ticket</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div>
                                    <label className="text-sm font-medium">Ticket Number</label>
                                    <Input value={newTicketNumber} onChange={e => setNewTicketNumber(e.target.value)} placeholder="e.g. 202345001" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Expiration Date</label>
                                    <Input type="datetime-local" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} />
                                </div>
                                <Button onClick={handleCreateTicket} disabled={loading} className="w-full">
                                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Create Ticket"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="relative mt-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tickets..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
                <div className="divide-y">
                    {filteredTickets.map(ticket => (
                        <div key={ticket.id} className="p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="font-bold text-lg">#{ticket.number}</div>
                                    <div className="text-sm text-muted-foreground">{ticket.project}</div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${ticket.status === 'Active' ? 'bg-green-100 text-green-800' :
                                    ticket.status === 'Expired' ? 'bg-red-100 text-red-800' :
                                        'bg-orange-100 text-orange-800'
                                    }`}>
                                    {ticket.status}
                                </span>
                            </div>

                            <TicketTimer
                                expirationDate={new Date(ticket.expiration)}
                                ticketNumber={ticket.number}
                            />

                            <div className="mt-2 flex justify-end gap-2">
                                <button className="text-xs text-blue-600 hover:underline">View Details</button>
                                <span className="text-gray-300">|</span>
                                <button className="text-xs text-blue-600 hover:underline">Renew</button>
                            </div>
                        </div>
                    ))}
                    {filteredTickets.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                            No tickets found.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
