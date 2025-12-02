"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BigButton } from "@/components/ui/BigButton";
import { CheckCircle, XCircle, Camera, Truck, AlertTriangle } from "lucide-react";

interface InspectionChecklistProps {
    assetId: string;
    assetName: string;
    onComplete: () => void;
}

const TRUCK_CHECKLIST = [
    "Brakes (Service & Parking)",
    "Lights (Head, Tail, Turn, Brake)",
    "Tires (Tread, Pressure, Lug Nuts)",
    "Fluids (Oil, Coolant, Hydraulic)",
    "Wipers & Mirrors",
    "Horn & Backup Alarm",
    "Fire Extinguisher & Triangles"
];

export function InspectionChecklist({ assetId, assetName, onComplete }: InspectionChecklistProps) {
    const [results, setResults] = useState<Record<string, "Pass" | "Fail" | null>>({});
    const [notes, setNotes] = useState("");

    const handleCheck = (item: string, status: "Pass" | "Fail") => {
        setResults(prev => ({ ...prev, [item]: status }));
    };

    const allChecked = TRUCK_CHECKLIST.every(item => results[item] !== undefined && results[item] !== null);
    const hasFailures = Object.values(results).includes("Fail");

    const handleSubmit = () => {
        if (!allChecked) {
            alert("Please complete all items.");
            return;
        }
        if (hasFailures && !notes) {
            alert("Please add notes/photos for failed items.");
            return;
        }
        // Server action to save Inspection
        console.log("Submitting inspection:", { assetId, results, notes });
        alert("Inspection Submitted!");
        onComplete();
    };

    return (
        <Card className="max-w-2xl mx-auto border-orange-500 border-2">
            <CardHeader className="bg-orange-50 dark:bg-orange-950/20">
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                    <Truck className="h-6 w-6" />
                    Pre-Trip Inspection (DVIR)
                </CardTitle>
                <p className="text-sm text-muted-foreground">Inspecting: <span className="font-bold">{assetName}</span></p>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                {TRUCK_CHECKLIST.map((item) => (
                    <div key={item} className="flex items-center justify-between p-3 border-b last:border-0">
                        <span className="font-medium text-lg">{item}</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleCheck(item, "Pass")}
                                className={`p-2 rounded-full transition-colors ${results[item] === "Pass"
                                    ? "bg-green-100 text-green-600 dark:bg-green-900/30"
                                    : "bg-secondary text-muted-foreground hover:bg-green-50"
                                    }`}
                            >
                                <CheckCircle className="h-8 w-8" />
                            </button>
                            <button
                                onClick={() => handleCheck(item, "Fail")}
                                className={`p-2 rounded-full transition-colors ${results[item] === "Fail"
                                    ? "bg-red-100 text-red-600 dark:bg-red-900/30"
                                    : "bg-secondary text-muted-foreground hover:bg-red-50"
                                    }`}
                            >
                                <XCircle className="h-8 w-8" />
                            </button>
                        </div>
                    </div>
                ))}

                {hasFailures && (
                    <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-200 dark:border-red-800 animate-in fade-in slide-in-from-top-2">
                        <h4 className="font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Defects Reported - Action Required
                        </h4>
                        <textarea
                            className="w-full p-2 border rounded bg-background"
                            placeholder="Describe defects here..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                        <BigButton
                            label="ADD PHOTO"
                            icon={Camera}
                            variant="outline"
                            className="mt-2 border-red-300 text-red-700"
                            onClick={() => alert("Camera API not connected")}
                        />
                    </div>
                )}

                <BigButton
                    label="SIGN & SUBMIT DVIR"
                    onClick={handleSubmit}
                    disabled={!allChecked}
                    className={allChecked ? "bg-green-600 hover:bg-green-700" : "opacity-50"}
                />
            </CardContent>
        </Card>
    );
}
