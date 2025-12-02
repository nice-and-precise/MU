"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BigButton } from "@/components/ui/BigButton";
import { Users, UserPlus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data - in real app, fetch from DB
const AVAILABLE_EMPLOYEES = [
    { id: "1", name: "John Doe", role: "Operator" },
    { id: "2", name: "Jane Smith", role: "Locator" },
    { id: "3", name: "Bob Johnson", role: "Laborer" },
    { id: "4", name: "Mike Brown", role: "Laborer" },
];

export function CrewDispatch() {
    const [crewMembers, setCrewMembers] = useState<typeof AVAILABLE_EMPLOYEES>([]);
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [selectedRole, setSelectedRole] = useState("");

    function addMember() {
        if (!selectedEmployee) return;
        const employee = AVAILABLE_EMPLOYEES.find(e => e.id === selectedEmployee);
        if (employee && !crewMembers.find(m => m.id === employee.id)) {
            // Allow overriding the default role for this specific dispatch
            const memberWithRole = { ...employee, role: selectedRole || employee.role };
            setCrewMembers([...crewMembers, memberWithRole]);
        }
        setSelectedEmployee("");
        setSelectedRole("");
    }

    function removeMember(id: string) {
        setCrewMembers(crewMembers.filter(m => m.id !== id));
    }

    function handleDispatch() {
        if (crewMembers.length === 0) {
            alert("Add crew members first.");
            return;
        }
        // Call server action to create crew or assign to project
        // In real app: await dispatchCrew({ members: crewMembers });
        alert(`Dispatched crew of ${crewMembers.length} to site!`);
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-6 w-6" />
                    Crew Dispatch
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 space-y-2 w-full">
                        <Label>Add Crew Member</Label>
                        <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                            <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select Employee" />
                            </SelectTrigger>
                            <SelectContent>
                                {AVAILABLE_EMPLOYEES.filter(e => !crewMembers.find(m => m.id === e.id)).map(e => (
                                    <SelectItem key={e.id} value={e.id}>
                                        {e.name} - {e.role}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                        <Label>Assign Role (Optional)</Label>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger className="h-12">
                                <SelectValue placeholder="Default Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Foreman">Foreman</SelectItem>
                                <SelectItem value="Operator">Operator</SelectItem>
                                <SelectItem value="Locator">Locator</SelectItem>
                                <SelectItem value="Laborer">Laborer</SelectItem>
                                <SelectItem value="Truck Driver">Truck Driver</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <BigButton
                        label="ADD"
                        icon={UserPlus}
                        onClick={addMember}
                        className="w-full md:w-auto min-h-[48px] py-2"
                        fullWidth={false}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Current Crew ({crewMembers.length})</Label>
                    {crewMembers.length === 0 ? (
                        <div className="text-muted-foreground italic p-4 border border-dashed rounded-lg text-center">
                            No members assigned.
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            {crewMembers.map(member => (
                                <div key={member.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border">
                                    <div>
                                        <div className="font-bold">{member.name}</div>
                                        <div className="text-xs text-muted-foreground">Assigned: <span className="font-semibold text-foreground">{member.role}</span></div>
                                    </div>
                                    <button onClick={() => removeMember(member.id)} className="text-red-500 hover:bg-red-100 p-2 rounded-full">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <BigButton
                    label="DISPATCH CREW"
                    icon={Users}
                    onClick={handleDispatch}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                />
            </CardContent>
        </Card>
    );
}

