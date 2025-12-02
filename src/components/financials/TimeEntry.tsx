"use client";

import React, { useState } from "react";
import { BigButton } from "@/components/ui/BigButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createTimeCards } from "@/actions/financials";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimeEntryProps {
    projectId: string;
    employeeId: string; // In real app, select employee or use current user
    employeeName?: string;
}

interface TimeSplit {
    id: number;
    hours: string;
    code: string;
    payrollItem: string;
}

export function TimeEntry({ projectId, employeeId, employeeName = "Current Employee" }: TimeEntryProps) {
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [splits, setSplits] = useState<TimeSplit[]>([
        { id: 1, hours: "8", code: "Drilling", payrollItem: "Regular Pay" }
    ]);

    function addSplit() {
        setSplits([
            ...splits,
            { id: Date.now(), hours: "", code: "Labor", payrollItem: "Regular Pay" }
        ]);
    }

    function removeSplit(id: number) {
        setSplits(splits.filter(s => s.id !== id));
    }

    function updateSplit(id: number, field: keyof TimeSplit, value: string) {
        setSplits(splits.map(s => s.id === id ? { ...s, [field]: value } : s));
    }

    async function handleSubmit() {
        // Validate
        const totalHours = splits.reduce((acc, curr) => acc + parseFloat(curr.hours || "0"), 0);
        if (totalHours === 0) {
            alert("Total hours cannot be zero.");
            return;
        }

        const entries = splits.map(s => ({
            hours: parseFloat(s.hours),
            code: s.code,
            payrollItem: s.payrollItem,
            serviceItem: s.code, // Mapping code to service item for simplicity
            notes: `Split entry for ${date}`
        }));

        const res = await createTimeCards({
            employeeId,
            projectId,
            date: new Date(date),
            entries
        });

        if (res.success) {
            alert("Time card saved successfully!");
            setSplits([{ id: Date.now(), hours: "", code: "Drilling", payrollItem: "Regular Pay" }]);
        } else {
            alert("Failed to save time card.");
        }
    }

    return (
        <Card className="max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle>Time Entry - {employeeName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="h-14 text-lg"
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label className="text-lg">Time Splits</Label>
                        <Button onClick={addSplit} variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" /> Add Split
                        </Button>
                    </div>

                    {splits.map((split, index) => (
                        <div key={split.id} className="grid grid-cols-12 gap-2 items-end border p-4 rounded-lg bg-muted/20">
                            <div className="col-span-3 space-y-1">
                                <Label>Hours</Label>
                                <Input
                                    type="number"
                                    value={split.hours}
                                    onChange={(e) => updateSplit(split.id, "hours", e.target.value)}
                                    className="h-12"
                                />
                            </div>
                            <div className="col-span-4 space-y-1">
                                <Label>Service Item</Label>
                                <Select value={split.code} onValueChange={(v) => updateSplit(split.id, "code", v)}>
                                    <SelectTrigger className="h-12">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Drilling">Drilling</SelectItem>
                                        <SelectItem value="Labor">Labor</SelectItem>
                                        <SelectItem value="Mobilization">Mobilization</SelectItem>
                                        <SelectItem value="Shop Time">Shop Time</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-4 space-y-1">
                                <Label>Payroll Item</Label>
                                <Select value={split.payrollItem} onValueChange={(v) => updateSplit(split.id, "payrollItem", v)}>
                                    <SelectTrigger className="h-12">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Regular Pay">Regular Pay</SelectItem>
                                        <SelectItem value="Overtime">Overtime</SelectItem>
                                        <SelectItem value="Prevailing Wage">Prevailing Wage</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-1 pb-2">
                                {splits.length > 1 && (
                                    <Button variant="ghost" size="icon" onClick={() => removeSplit(split.id)} className="text-red-500">
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-4 border-t">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xl font-bold">Total Hours:</span>
                        <span className="text-2xl font-bold text-orange-600">
                            {splits.reduce((acc, curr) => acc + (parseFloat(curr.hours) || 0), 0).toFixed(1)}
                        </span>
                    </div>
                    <BigButton
                        label="SUBMIT TIME CARD"
                        icon={Save}
                        onClick={handleSubmit}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
