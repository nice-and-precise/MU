"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateExcavationEarliestFromMeet } from "@/lib/216d/timeRules";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface MeetTicketFormProps {
    projectId: string;
    ticketId?: string;
    onComplete: (data: any) => void;
}

export function MeetTicketForm({ projectId, ticketId, onComplete }: MeetTicketFormProps) {
    const [meetTime, setMeetTime] = useState("");
    const [excavationStart, setExcavationStart] = useState<Date | null>(null);
    const [location, setLocation] = useState("");
    const [notes, setNotes] = useState("");
    const [attendees, setAttendees] = useState<any[]>([]);
    const [currentAttendee, setCurrentAttendee] = useState({ name: "", company: "", role: "EXCAVATOR" });
    const [loading, setLoading] = useState(false);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setMeetTime(val);
        if (val) {
            const date = new Date(val);
            const start = calculateExcavationEarliestFromMeet(date);
            setExcavationStart(start);
        }
    };

    const addAttendee = () => {
        if (currentAttendee.name && currentAttendee.company) {
            setAttendees([...attendees, currentAttendee]);
            setCurrentAttendee({ name: "", company: "", role: "EXCAVATOR" });
        }
    };

    const removeAttendee = (index: number) => {
        setAttendees(attendees.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!ticketId) {
            toast.error("Missing Ticket ID. Cannot link meet.");
            return;
        }

        setLoading(true);

        try {
            // 1. Create Meet Ticket in DB
            const { createMeetTicket } = await import("@/actions/216d/compliance");
            const meetRes = await createMeetTicket({
                projectId,
                ticketId,
                meetTime,
                excavationStart: excavationStart?.toISOString() || new Date().toISOString(), // Fallback if null (though UI prevents it)
                location,
                attendees,
                notes
            });

            if (!meetRes?.data) {
                toast.error("Failed to create meet: " + (meetRes?.error || "Unknown error"));
                setLoading(false);
                return;
            }

            const meet = meetRes.data;

            // 2. Submit Documentation to GSOC (Stub/API)
            const { submitMeetDocumentation } = await import("@/actions/iticnxt");
            const submitRes = await submitMeetDocumentation({ meetTicketId: meet.id, projectId });

            if (submitRes?.data?.success) {
                toast.success("Meet scheduled and documentation submitted to GSOC/ITICnxt.");
                onComplete(meet);
            } else {
                toast.error("Meet saved, but failed to submit to GSOC: " + (submitRes?.error || "Unknown error"));
                // Still complete, but warn
                onComplete(meet);
            }

        } catch (error) {
            console.error(error);
            toast.error("Failed to schedule meet.");
        }
        setLoading(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Schedule Meet & Submit Documentation</CardTitle>
                <CardDescription>
                    Required for projects {'>'} 1 mile. Captures attendees and agreements per 216D.04 Subd.1b.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="meetTime">Meet Date & Time</Label>
                            <Input
                                id="meetTime"
                                type="datetime-local"
                                value={meetTime}
                                onChange={handleDateChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Meet Location</Label>
                            <Input
                                id="location"
                                placeholder="e.g. Intersection of 5th & Main"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                    </div>

                    {excavationStart && (
                        <div className="p-4 bg-amber-50 rounded-md border border-amber-100 flex justify-between items-center">
                            <div>
                                <p className="text-sm text-amber-800 font-medium">Earliest Excavation Start:</p>
                                <p className="text-lg font-bold text-amber-900">
                                    {format(excavationStart, "PPpp")}
                                </p>
                            </div>
                            <div className="text-xs text-amber-600 max-w-[200px] text-right">
                                (48 hours after meet start)
                            </div>
                        </div>
                    )}

                    <div className="space-y-3 border p-4 rounded-md">
                        <Label>Attendees Log</Label>
                        <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-4">
                                <Input
                                    placeholder="Name"
                                    value={currentAttendee.name}
                                    onChange={(e) => setCurrentAttendee({ ...currentAttendee, name: e.target.value })}
                                />
                            </div>
                            <div className="col-span-4">
                                <Input
                                    placeholder="Company"
                                    value={currentAttendee.company}
                                    onChange={(e) => setCurrentAttendee({ ...currentAttendee, company: e.target.value })}
                                />
                            </div>
                            <div className="col-span-3">
                                <Select
                                    value={currentAttendee.role}
                                    onValueChange={(v) => setCurrentAttendee({ ...currentAttendee, role: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EXCAVATOR">Excavator</SelectItem>
                                        <SelectItem value="LOCATOR">Locator</SelectItem>
                                        <SelectItem value="OPERATOR">Operator</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-1">
                                <Button type="button" size="icon" onClick={addAttendee} disabled={!currentAttendee.name}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {attendees.length > 0 && (
                            <div className="space-y-2 mt-2">
                                {attendees.map((attendee, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded">
                                        <span>{attendee.name} ({attendee.company}) - {attendee.role}</span>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => removeAttendee(idx)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Agreement Notes / Diagram URL</Label>
                        <Textarea
                            placeholder="Summary of agreements, marking instructions, or link to diagram..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Submitting to GSOC..." : "Schedule Meet & Submit"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
