"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateLocateReadyAt } from "@/lib/216d/timeRules";
import { format } from "date-fns";

interface GsocTicketFormProps {
    projectId: string;
    onComplete: (data: any) => void;
}

export function GsocTicketForm({ projectId, onComplete }: GsocTicketFormProps) {
    const [ticketNumber, setTicketNumber] = useState("");
    const [ticketType, setTicketType] = useState("NORMAL");
    const [filedAt, setFiledAt] = useState("");
    const [legalReady, setLegalReady] = useState<Date | null>(null);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setFiledAt(val);
        if (val) {
            const date = new Date(val);
            const ready = calculateLocateReadyAt(date);
            setLegalReady(ready);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { createGsocTicket } = await import("@/actions/216d/compliance");
            const res = await createGsocTicket({
                projectId,
                ticketNumber,
                ticketType,
                filedAt,
                legalReady: legalReady?.toISOString(),
                legalExcavationStart: null // Or calculated/passed
            });

            if (res?.data) {
                onComplete(res.data);
            } else {
                console.error(res?.error);
                // Optionally show toast
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>File GSOC Ticket</CardTitle>
                <CardDescription>
                    Enter the ticket details confirmed by Gopher State One Call.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="ticketNumber">Ticket Number</Label>
                            <Input
                                id="ticketNumber"
                                placeholder="e.g. 2501010001"
                                value={ticketNumber}
                                onChange={(e) => setTicketNumber(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ticketType">Ticket Type</Label>
                            <Select value={ticketType} onValueChange={setTicketType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NORMAL">Normal</SelectItem>
                                    <SelectItem value="EMERGENCY">Emergency</SelectItem>
                                    <SelectItem value="MEET">Meet</SelectItem>
                                    <SelectItem value="UPDATE">Update</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="filedAt">Filed At (Confirmation Time)</Label>
                        <Input
                            id="filedAt"
                            type="datetime-local"
                            value={filedAt}
                            onChange={handleDateChange}
                            required
                        />
                    </div>

                    {legalReady && (
                        <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
                            <p className="text-sm text-blue-800 font-medium">Legal Locate Ready:</p>
                            <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                {format(legalReady, "PPpp")}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                                (Excludes weekends and holidays)
                            </p>
                        </div>
                    )}

                    <Button type="submit" className="w-full">Record Ticket</Button>
                </form>
            </CardContent>
        </Card>
    );
}
