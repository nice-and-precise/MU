"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createDamageEvent } from "@/actions/216d/compliance";

interface DamageFormProps {
    projectId: string;
    ticketId?: string;
    onClose: () => void;
}

export function DamageForm({ projectId, ticketId, onClose }: DamageFormProps) {
    const [facilityType, setFacilityType] = useState("UNKNOWN");
    const [description, setDescription] = useState("");
    const [contactMade, setContactMade] = useState(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createDamageEvent({
            projectId,
            ticketId,
            facilityType,
            description,
            contactWasMade: contactMade
        });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
                <h3 className="text-red-800 font-bold">Report Damage / Contact</h3>
                <p className="text-sm text-red-600">Ensure emergency services are contacted if gas or hazardous.</p>
            </div>

            <div className="space-y-2">
                <Label>Facility Type</Label>
                <Select value={facilityType} onValueChange={setFacilityType}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="GAS">Gas</SelectItem>
                        <SelectItem value="ELECTRIC">Electric</SelectItem>
                        <SelectItem value="WATER">Water</SelectItem>
                        <SelectItem value="FIBER">Fiber/Comms</SelectItem>
                        <SelectItem value="SEWER">Sewer</SelectItem>
                        <SelectItem value="UNKNOWN">Unknown</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                    placeholder="Describe the damage and location..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>

            <Button type="submit" variant="destructive" className="w-full">Report Damage</Button>
        </form>
    );
}
