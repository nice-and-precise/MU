"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateExcavationEarliestFromMeet } from "@/lib/216d/timeRules";
import { format } from "date-fns";

interface MeetTicketFormProps {
    projectId: string;
    onComplete: (data: any) => void;
}

export function MeetTicketForm({ projectId, onComplete }: MeetTicketFormProps) {
    const [meetTime, setMeetTime] = useState("");
    const [excavationStart, setExcavationStart] = useState<Date | null>(null);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setMeetTime(val);
        if (val) {
            const date = new Date(val);
            const start = calculateExcavationEarliestFromMeet(date);
            setExcavationStart(start);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onComplete({ meetTime, excavationStart });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Schedule Meet</CardTitle>
                <CardDescription>
                    Required for projects {'>'} 1 mile or crossing county lines.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
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

                    {excavationStart && (
                        <div className="p-4 bg-amber-50 rounded-md border border-amber-100">
                            <p className="text-sm text-amber-800 font-medium">Earliest Excavation Start:</p>
                            <p className="text-lg font-bold text-amber-900">
                                {format(excavationStart, "PPpp")}
                            </p>
                            <p className="text-xs text-amber-600 mt-1">
                                (48 hours after meet, excluding weekends/holidays)
                            </p>
                        </div>
                    )}

                    <Button type="submit" className="w-full">Schedule Meet</Button>
                </form>
            </CardContent>
        </Card>
    );
}
