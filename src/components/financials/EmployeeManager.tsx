"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BigButton } from "@/components/ui/BigButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCog, Briefcase, MapPin } from "lucide-react";

// Mock Data
const EMPLOYEES = [
    { id: "1", name: "John Doe", role: "Operator", currentJob: "Project Alpha", ssn: "***-**-1234", address: "123 Maple St, Springfield", taxStatus: "W-4 Single", payRate: 35.00 },
    { id: "2", name: "Jane Smith", role: "Locator", currentJob: "Unassigned", ssn: "***-**-5678", address: "456 Oak Ln, Shelbyville", taxStatus: "W-4 Married", payRate: 32.50 },
    { id: "3", name: "Bob Johnson", role: "Laborer", currentJob: "Project Beta", ssn: "***-**-9012", address: "789 Pine Rd, Capital City", taxStatus: "1099 Contractor", payRate: 25.00 },
];

const PROJECTS = [
    { id: "p1", name: "Project Alpha", location: "123 Main St" },
    { id: "p2", name: "Project Beta", location: "456 Oak Ave" },
];

export function EmployeeManager() {
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [newRole, setNewRole] = useState("");
    const [newJob, setNewJob] = useState("");

    const employee = EMPLOYEES.find(e => e.id === selectedEmployee);

    function handleUpdate() {
        if (!selectedEmployee) return;
        // Call server action to update employee
        alert(`Updated ${employee?.name}: Role=${newRole || employee?.role}, Job=${newJob || employee?.currentJob}`);
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCog className="h-6 w-6" />
                        Employee Management
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Select Employee</Label>
                        <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                            <SelectTrigger className="h-14 text-lg">
                                <SelectValue placeholder="Choose an employee..." />
                            </SelectTrigger>
                            <SelectContent>
                                {EMPLOYEES.map(e => (
                                    <SelectItem key={e.id} value={e.id}>
                                        {e.name} ({e.role}) - {e.currentJob}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {employee && (
                        <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4">
                            <div className="space-y-4 p-4 border rounded-lg bg-secondary/10">
                                <div className="flex items-center gap-2 font-bold text-lg">
                                    <Briefcase className="h-5 w-5" />
                                    Role & Position
                                </div>
                                <div className="space-y-2">
                                    <Label>Default Role</Label>
                                    <Select value={newRole || employee.role} onValueChange={setNewRole}>
                                        <SelectTrigger>
                                            <SelectValue />
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
                            </div>

                            <div className="space-y-4 p-4 border rounded-lg bg-secondary/10">
                                <div className="flex items-center gap-2 font-bold text-lg">
                                    <MapPin className="h-5 w-5" />
                                    Job Assignment
                                </div>
                                <div className="space-y-2">
                                    <Label>Current Project</Label>
                                    <Select value={newJob || (employee.currentJob === "Unassigned" ? "" : employee.currentJob)} onValueChange={setNewJob}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Unassigned" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unassigned">Unassigned</SelectItem>
                                            {PROJECTS.map(p => (
                                                <SelectItem key={p.id} value={p.name}>
                                                    {p.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Assigning a job will make it appear in their "My Jobs" list.
                                    </p>
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-4 p-4 border rounded-lg bg-secondary/10">
                                <div className="flex items-center gap-2 font-bold text-lg">
                                    <Briefcase className="h-5 w-5" />
                                    Payroll Information (QuickBooks)
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Social Security Number</Label>
                                        <Input defaultValue={employee.ssn} placeholder="XXX-XX-XXXX" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Home Address</Label>
                                        <Input defaultValue={employee.address} placeholder="Full Address" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tax Filing Status</Label>
                                        <Select defaultValue={employee.taxStatus}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="W-4 Single">W-4 Single</SelectItem>
                                                <SelectItem value="W-4 Married">W-4 Married</SelectItem>
                                                <SelectItem value="1099 Contractor">1099 Contractor</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Hourly Pay Rate ($)</Label>
                                        <Input type="number" defaultValue={employee.payRate} placeholder="0.00" />
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <BigButton
                                    label="UPDATE EMPLOYEE"
                                    onClick={handleUpdate}
                                    className="bg-orange-600 hover:bg-orange-700 text-white"
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
