"use client";

import React, { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BigButton } from "@/components/ui/BigButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCog, Briefcase, MapPin, Plus, Save, Loader2, Key } from "lucide-react";
import { updateEmployee, createEmployee, createSystemUser } from "@/actions/employees";
import { Employee, Crew, CrewMember, User } from "@prisma/client";

type EmployeeWithRelations = Employee & {
    crews: (CrewMember & { crew: Crew })[];
    foremanCrews: Crew[];
    user: User | null;
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
                paySchedule: "WEEKLY",
                hourlyRate: 0,
                defaultOvertimeMultiplier: 1.5,
                doubleTimeMultiplier: 2.0,
                is1099: false,
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
                    const res = await updateEmployee({ id: selectedEmployeeId, data: formData as any });
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
                                    <div className="space-y-2">
                                        <Label>Date of Birth</Label>
                                        <Input
                                            type="date"
                                            value={formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : ""}
                                            onChange={e => handleChange("dob", e.target.value ? new Date(e.target.value) : null)}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 mt-4 border-t border-gray-200">
                                    <div className="flex items-center gap-2 font-bold text-sm text-gray-600 mb-3">
                                        Emergency Contact
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Contact Details (JSON)</Label>
                                        <Input
                                            value={formData.emergencyContact || ""}
                                            placeholder='{"name": "Jane Doe", "phone": "555-0199", "relation": "Spouse"}'
                                            onChange={e => handleChange("emergencyContact", e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">Enter Name, Phone, and Relation.</p>
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
                                <div className="space-y-2">
                                    <Label>Hire Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.hireDate ? new Date(formData.hireDate).toISOString().split('T')[0] : ""}
                                        onChange={e => handleChange("hireDate", e.target.value ? new Date(e.target.value) : null)}
                                    />
                                </div>
                            </div>

                            {/* Payroll & Tax */}
                            <div className="md:col-span-2 space-y-4 p-4 border rounded-lg bg-secondary/10">
                                <div className="flex items-center gap-2 font-bold text-lg">
                                    <Briefcase className="h-5 w-5" />
                                    Tax & Classification
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                        <Label>State (Res / Work)</Label>
                                        <div className="flex gap-2">
                                            <Input placeholder="Res" value={formData.primaryState || ""} onChange={e => handleChange("primaryState", e.target.value)} />
                                            <Input placeholder="Work" value={formData.primaryWorkState || ""} onChange={e => handleChange("primaryWorkState", e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>1099 Classification</Label>
                                        <div className="flex items-center space-x-2 h-10">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4"
                                                checked={!!formData.is1099}
                                                onChange={e => handleChange("is1099", e.target.checked)}
                                            />
                                            <span className="text-sm">Is 1099 Contractor</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>SSN (Encrypted)</Label>
                                        <Input value={formData.ssn || ""} placeholder="***-**-****" onChange={e => handleChange("ssn", e.target.value)} />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 font-bold text-lg mt-4">
                                    <Briefcase className="h-5 w-5" />
                                    Pay Structure
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                        <Label>Pay Schedule</Label>
                                        <Select value={formData.paySchedule || "WEEKLY"} onValueChange={v => handleChange("paySchedule", v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="WEEKLY">Weekly</SelectItem>
                                                <SelectItem value="BIWEEKLY">Bi-Weekly</SelectItem>
                                                <SelectItem value="SEMIMONTHLY">Semi-Monthly</SelectItem>
                                                <SelectItem value="MONTHLY">Monthly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Hourly Rate ($)</Label>
                                        <Input type="number" value={formData.hourlyRate || 0} onChange={e => handleChange("hourlyRate", parseFloat(e.target.value))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Overtime Rule</Label>
                                        <Select value={formData.overtimeRule || "OVER_40_WEEK"} onValueChange={v => handleChange("overtimeRule", v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="OVER_40_WEEK">Over 40h / Week</SelectItem>
                                                <SelectItem value="OVER_8_DAY">Over 8h / Day</SelectItem>
                                                <SelectItem value="UNION_X">Union (Special)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Multipliers (OT / DT)</Label>
                                        <div className="flex gap-2">
                                            <Input type="number" step="0.1" value={formData.defaultOvertimeMultiplier || 1.5} onChange={e => handleChange("defaultOvertimeMultiplier", parseFloat(e.target.value))} />
                                            <Input type="number" step="0.1" value={formData.doubleTimeMultiplier || 2.0} onChange={e => handleChange("doubleTimeMultiplier", parseFloat(e.target.value))} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 font-bold text-lg mt-4">
                                    <Briefcase className="h-5 w-5" />
                                    Integrations (QuickBooks)
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>QBO Employee ID</Label>
                                        <Input value={formData.qboEmployeeId || ""} onChange={e => handleChange("qboEmployeeId", e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>ADP Employee ID</Label>
                                        <Input value={formData.adpEmployeeId || ""} onChange={e => handleChange("adpEmployeeId", e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            {/* System Access */}
                            <div className="md:col-span-2 space-y-4 p-4 border rounded-lg bg-indigo-50 dark:bg-indigo-950/20">
                                <div className="flex items-center gap-2 font-bold text-lg text-indigo-700 dark:text-indigo-400">
                                    <Key className="h-5 w-5" />
                                    System Access
                                </div>

                                {selectedEmployee?.user ? (
                                    <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded border">
                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                            {selectedEmployee.user.name?.[0]?.toUpperCase() || "U"}
                                        </div>
                                        <div>
                                            <p className="font-medium">Linked User Account</p>
                                            <p className="text-xs text-muted-foreground">{selectedEmployee.user.email} ({selectedEmployee.user.role})</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                            This employee does not have a user account. Invite them to the portal to view their schedule and enter time.
                                        </p>
                                        <div className="flex gap-4 items-end">
                                            <div className="space-y-2 flex-1">
                                                <Label>System Role</Label>
                                                <Select defaultValue="CREW" onValueChange={(val) => setFormData(prev => ({ ...prev, _inviteRole: val } as any))}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="CREW">Crew Member</SelectItem>
                                                        <SelectItem value="FOREMAN">Foreman</SelectItem>
                                                        <SelectItem value="OFFICE">Office Admin</SelectItem>
                                                        <SelectItem value="SUPER">Supervisor</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <BigButton
                                                label="CREATE USER ACCOUNT"
                                                icon={Key}
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                onClick={async () => {
                                                    if (!selectedEmployeeId || selectedEmployeeId === "new") {
                                                        alert("Save employee first.");
                                                        return;
                                                    }
                                                    if (!formData.email) {
                                                        alert("Email is required to create a user.");
                                                        return;
                                                    }
                                                    if (confirm(`Create user for ${formData.email} with password 'Welcome123!'?`)) {
                                                        const res = await createSystemUser({
                                                            employeeId: selectedEmployeeId,
                                                            email: formData.email,
                                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                            role: (formData as any)._inviteRole || 'CREW'
                                                        });
                                                        if (res.success) {
                                                            alert("User created!");
                                                            window.location.reload();
                                                        } else {
                                                            alert("Error creating user: " + (res as any).serverError || "Unknown");
                                                        }
                                                    }
                                                }}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white w-auto"
                                            />
                                        </div>
                                    </div>
                                )}
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

