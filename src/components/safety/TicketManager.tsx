"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BigButton } from "@/components/ui/BigButton";
import { TicketTimer } from "@/components/safety/TicketTimer";
import { Plus, FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// Mock data
const MOCK_TICKETS = [
    { id: "1", number: "202345001", project: "Fiber Install - Willmar", expiration: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), status: "Active" },
    { id: "2", number: "202345002", project: "Water Main - Spicer", expiration: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(), status: "Expiring Soon" },
    { id: "3", number: "202345003", project: "Emergency Repair - Hwy 12", expiration: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), status: "Expired" },
];

interface Ticket {
    id: string;
    number: string;
    project: string;
    expiration: string;
    status: string;
}

interface TicketManagerProps {
    projectId?: string;
    initialTickets?: Ticket[];
}

export function TicketManager({ projectId, initialTickets }: TicketManagerProps) {
    const [tickets, setTickets] = useState<Ticket[]>(initialTickets || MOCK_TICKETS);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredTickets = tickets.filter(t =>
        t.number.includes(searchTerm) || t.project.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="border-b bg-slate-50">
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-orange-600" />
                        811 Ticket Management
                    </CardTitle>
                    <BigButton label="NEW TICKET" icon={Plus} onClick={() => alert("New Ticket Modal")} className="h-8 text-xs" fullWidth={false} />
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
                </div>
            </CardContent>
        </Card>
    );
}
