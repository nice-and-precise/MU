"use client";

import React, { useState } from "react";
import { BigButton } from "@/components/ui/BigButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPothole } from "@/actions/hdd";
import { Camera, Save } from "lucide-react";

interface PotholeLogProps {
    projectId: string;
    userId: string;
}

export function PotholeLog({ projectId, userId }: PotholeLogProps) {
    const [utilityType, setUtilityType] = useState("");
    const [depth, setDepth] = useState("");
    const [photoUrl, setPhotoUrl] = useState(""); // In real app, this would be from file upload
    const [notes, setNotes] = useState("");

    async function handleSubmit() {
        if (!utilityType || !depth || !photoUrl) {
            alert("Utility Type, Depth, and Photo are required!");
            return;
        }

        const res = await createPothole({
            projectId,
            utilityType,
            depth: parseFloat(depth),
            visualVerificationPhoto: photoUrl,
            notes,
            // createdById injected by server action
        });

        if (res?.data) {
            alert("Pothole logged successfully!");
            setUtilityType("");
            setDepth("");
            setPhotoUrl("");
            setNotes("");
        } else {
            alert("Failed to log pothole: " + (res?.error || "Unknown error"));
        }
    }

    // Mock Photo Upload
    function handlePhotoUpload() {
        // Simulate upload
        const mockUrl = "https://example.com/pothole-photo.jpg";
        setPhotoUrl(mockUrl);
        alert("Photo uploaded (mock)!");
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Pothole / Daylighting Log</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Utility Type</Label>
                    <Input
                        value={utilityType}
                        onChange={(e) => setUtilityType(e.target.value)}
                        placeholder="e.g. Gas, Fiber, Water"
                        className="h-14 text-lg"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Depth (ft)</Label>
                    <Input
                        type="number"
                        value={depth}
                        onChange={(e) => setDepth(e.target.value)}
                        placeholder="0.0"
                        className="h-14 text-lg"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Visual Verification</Label>
                    <div className="flex gap-4 items-center">
                        <BigButton
                            label={photoUrl ? "Photo Uploaded" : "Take Photo"}
                            icon={Camera}
                            onClick={handlePhotoUpload}
                            variant={photoUrl ? "secondary" : "outline"}
                            className="flex-1"
                        />
                        {photoUrl && <span className="text-green-500 font-bold">✓</span>}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Notes</Label>
                    <Input
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Additional details..."
                    />
                </div>

                <BigButton
                    label="SAVE POTHOLE"
                    icon={Save}
                    onClick={handleSubmit}
                    className="bg-green-600 hover:bg-green-700 text-white mt-4"
                />
            </CardContent>
        </Card>
    );
}
