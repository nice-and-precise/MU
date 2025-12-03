"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createLocateRemark } from "@/actions/216d/compliance";

interface RemarkFormProps {
    projectId: string;
    ticketId: string;
    onClose: () => void;
}

export function RemarkForm({ projectId, ticketId, onClose }: RemarkFormProps) {
    const [type, setType] = useState("REMARK_REQUESTED");
    const [reason, setReason] = useState("MARKS_OBLITERATED");
    const [notes, setNotes] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createLocateRemark({ projectId, ticketId, type, reason, notes });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>Remark Type</Label>
                <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="REMARK_REQUESTED">Request Remark</SelectItem>
                        <SelectItem value="REMARK_COMPLETED">Record Completed Remark</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Reason</Label>
                <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="MARKS_OBLITERATED">Marks Obliterated</SelectItem>
                        <SelectItem value="WRONG_LOCATION">Wrong Location</SelectItem>
                        <SelectItem value="ADDITIONAL_AREA">Additional Area</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700">Submit Remark Request</Button>
        </form>
    );
}
