"use client";

import React, { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BigButton } from "@/components/ui/BigButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCog, Briefcase, MapPin, Plus, Save, Loader2 } from "lucide-react";
import { updateEmployee, createEmployee } from "@/actions/staff";
import { Employee, Crew, CrewMember } from "@prisma/client";

type EmployeeWithRelations = Employee & {
    crews: (CrewMember & { crew: Crew })[];
    foremanCrews: Crew[];
};

interface EmployeeManagerProps {
    initialEmployees: EmployeeWithRelations[];
}

export function EmployeeManager({ initialEmployees }: EmployeeManagerProps) {
    const [employees, setEmployees] = useState(initialEmployees);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
    const [isPending, startTransition] = useTransition();
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<Employee>>({});

    const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

    function handleSelect(id: string) {
        if (id === "new") {
            setIsCreating(true);
            setSelectedEmployeeId("");
            setFormData({
                firstName: "",
                lastName: "",
                role: "Laborer",
                status: "ACTIVE",
                payType: "HOURLY",
                hourlyRate: 0,
            });
        } else {
            setIsCreating(false);
            setSelectedEmployeeId(id);
            const emp = employees.find(e => e.id === id);
            if (emp) {
                setFormData(emp);
            }
        }
    }

    function handleChange(field: keyof Employee, value: any) {
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    function handleSave() {
        startTransition(async () => {
            try {
                if (isCreating) {
                    const res = await createEmployee(formData as any);
                    if (res.success && res.data) {
                        // Optimistic update or wait for revalidate
                        // For now, we rely on revalidatePath in action, but we should update local state to reflect change immediately if possible
                        // or just reload. Since we passed initialEmployees, we might need to refresh.
                        // Ideally the parent should re-fetch, but for now let's just alert.
                        alert("Employee created!");
                        window.location.reload(); // Simple reload to get fresh data
                    } else {
                        alert("Error creating employee");
                    }
                } else if (selectedEmployeeId) {
                    const res = await updateEmployee(selectedEmployeeId, formData);
                    if (res.success) {
                        alert("Employee updated!");
                        window.location.reload();
                    } else {
                        alert("Error updating employee");
                    }
                }
            } catch (e) {
                console.error(e);
                alert("An error occurred");
            }
        });
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <UserCog className="h-6 w-6" />
                            Employee Management
                        </div>
                        <BigButton
                            label="ADD NEW"
                            icon={Plus}
                            onClick={() => handleSelect("new")}
                            className="bg-green-600 hover:bg-green-700 text-white w-auto px-4 py-2 text-sm"
                        />
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Select Employee</Label>
                        <Select value={selectedEmployeeId} onValueChange={handleSelect}>
                            <SelectTrigger className="h-14 text-lg">
                                <SelectValue placeholder="Choose an employee to edit..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="new" className="text-green-600 font-bold">+ Create New Employee</SelectItem>
                                {employees.map(e => (
                                    <SelectItem key={e.id} value={e.id}>
                                        {e.firstName} {e.lastName} ({e.role})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {(selectedEmployeeId || isCreating) && (
                        <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4">
                            {/* Personal Info */}
                            <div className="space-y-4 p-4 border rounded-lg bg-secondary/10">
                                <div className="flex items-center gap-2 font-bold text-lg">
                                    <UserCog className="h-5 w-5" />
                                    Personal Information
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>First Name</Label>
                                        <Input value={formData.firstName || ""} onChange={e => handleChange("firstName", e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Last Name</Label>
                                        <Input value={formData.lastName || ""} onChange={e => handleChange("lastName", e.target.value)} />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label>Email</Label>
                                        <Input value={formData.email || ""} onChange={e => handleChange("email", e.target.value)} />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label>Phone</Label>
                                        <Input value={formData.phone || ""} onChange={e => handleChange("phone", e.target.value)} />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label>Home Address</Label>
                                        <Input value={formData.address || ""} onChange={e => handleChange("address", e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            {/* Employment & Role */}
                            <div className="space-y-4 p-4 border rounded-lg bg-secondary/10">
                                <div className="flex items-center gap-2 font-bold text-lg">
                                    <Briefcase className="h-5 w-5" />
                                    Role & Status
                                </div>
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Select value={formData.role || "Laborer"} onValueChange={v => handleChange("role", v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Foreman">Foreman</SelectItem>
                                            <SelectItem value="Operator">Operator</SelectItem>
                                            <SelectItem value="Locator">Locator</SelectItem>
                                            <SelectItem value="Laborer">Laborer</SelectItem>
                                            <SelectItem value="Truck Driver">Truck Driver</SelectItem>
                                            <SelectItem value="Office">Office / Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Detailed Position</Label>
                                    <Input value={formData.position || ""} placeholder="e.g. Lead Drill Operator" onChange={e => handleChange("position", e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select value={formData.status || "ACTIVE"} onValueChange={v => handleChange("status", v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">Active</SelectItem>
                                            <SelectItem value="TERMINATED">Terminated</SelectItem>
                                            <SelectItem value="LEAVE">On Leave</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Payroll */}
                            <div className="md:col-span-2 space-y-4 p-4 border rounded-lg bg-secondary/10">
                                <div className="flex items-center gap-2 font-bold text-lg">
                                    <Briefcase className="h-5 w-5" />
                                    Payroll & Tax (QuickBooks Compatible)
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>SSN (Encrypted)</Label>
                                        <Input value={formData.ssn || ""} placeholder="***-**-****" onChange={e => handleChange("ssn", e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tax Status</Label>
                                        <Select value={formData.taxStatus || "W-4 Single"} onValueChange={v => handleChange("taxStatus", v)}>
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
                                        <Label>Pay Type</Label>
                                        <Select value={formData.payType || "HOURLY"} onValueChange={v => handleChange("payType", v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="HOURLY">Hourly</SelectItem>
                                                <SelectItem value="SALARY">Salary</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Hourly Rate ($)</Label>
                                        <Input type="number" value={formData.hourlyRate || 0} onChange={e => handleChange("hourlyRate", parseFloat(e.target.value))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>QBO Employee ID</Label>
                                        <Input value={formData.qboEmployeeId || ""} onChange={e => handleChange("qboEmployeeId", e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <BigButton
                                    label={isPending ? "SAVING..." : (isCreating ? "CREATE EMPLOYEE" : "UPDATE EMPLOYEE")}
                                    icon={isPending ? Loader2 : Save}
                                    onClick={handleSave}
                                    disabled={isPending}
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

