"use client";

import { useState, useTransition, useEffect } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Users, Plus, Search, FileText, Phone, Mail,
    Construction, DollarSign, Calendar, Shield,
    MoreHorizontal, Edit, Trash2, CheckCircle2, AlertCircle, Eye, EyeOff
} from "lucide-react";
import { createEmployee, updateEmployee } from "@/actions/employees";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";

// Reuse previous types but inferred or imported would be better
interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    email?: string | null;
    phone?: string | null;
    hourlyRate?: number | null;
    emergencyContact?: string | null;
    ssn?: string | null;
    payType?: string;
    photoUrl?: string | null;
    address?: string | null;
    dob?: Date | string | null;
    position?: string | null;
    hireDate?: Date | string | null;
    taxStatus?: string | null;
    primaryState?: string | null;
    primaryWorkState?: string | null;
    is1099?: boolean;
    paySchedule?: string;
    overtimeRule?: string | null;
    defaultOvertimeMultiplier?: number | null;
    doubleTimeMultiplier?: number | null;
    qboEmployeeId?: string | null;
    defaultEarningCode?: string | null;
    adpEmployeeId?: string | null;
    user?: {
        name?: string | null;
        email?: string | null;
        role?: string | null;
    } | null;
}

interface EmployeeManagerProps {
    employees: Employee[];
}

export function EmployeeManager({ employees }: EmployeeManagerProps) {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Derived state for filtered employees
    const filteredEmployees = employees.filter(emp =>
        emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEditClick = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsEditing(true);
        setIsDialogOpen(true);
    };

    const handleCreateClick = () => {
        setSelectedEmployee(null); // Clear selection for new
        setIsEditing(false);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Team Members</h2>
                    <p className="text-muted-foreground">Manage your roster, payroll details, and access.</p>
                </div>
                <Button onClick={handleCreateClick} className="bg-[#003366] text-white hover:bg-[#002244]">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Employee
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or role..."
                            className="pl-9 max-w-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead className="hidden md:table-cell">Role</TableHead>
                                    <TableHead className="hidden md:table-cell">Status</TableHead>
                                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEmployees.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-48 text-center">
                                            <EmptyState
                                                title="No employees found"
                                                description="Get started by adding your first crew member."
                                                actionLabel="Add Employee"
                                                onAction={handleCreateClick}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredEmployees.map((employee) => (
                                        <TableRow key={employee.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarFallback>{employee.firstName[0]}{employee.lastName[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{employee.lastName}, {employee.firstName}</div>
                                                        <div className="md:hidden text-xs text-muted-foreground">{employee.role}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <Badge variant="outline" className="font-normal">
                                                    {employee.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <Badge className={
                                                    employee.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" :
                                                        "bg-slate-100 text-slate-800 hover:bg-slate-100"
                                                }>
                                                    {employee.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <div className="grid gap-1 text-sm text-muted-foreground">
                                                    {employee.email && <div className="flex items-center gap-2"><Mail className="h-3 w-3" />{employee.email}</div>}
                                                    {employee.phone && <div className="flex items-center gap-2"><Phone className="h-3 w-3" />{employee.phone}</div>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(employee)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <EmployeeDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                employee={selectedEmployee}
                isEditing={isEditing}
            />
        </div>
    );
}

function EmployeeDialog({ open, onOpenChange, employee, isEditing }: { open: boolean, onOpenChange: (Open: boolean) => void, employee: Employee | null, isEditing: boolean }) {
    const router = useRouter();
    const [formData, setFormData] = useState<Partial<Employee>>({});
    const [eContact, setEContact] = useState({ name: "", phone: "", relation: "" });
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (payload: any) => {
        startTransition(async () => {
            try {
                // @ts-ignore - Assuming standard action signature
                const res = isEditing && employee?.id
                    ? await updateEmployee({ id: employee.id, data: payload })
                    : await createEmployee(payload);

                if (res?.success) {
                    toast.success(isEditing ? "Employee updated" : "Employee created");
                    onOpenChange(false);
                    router.refresh();
                } else {
                    // @ts-ignore
                    toast.error(res?.error || "Operation failed");
                }
            } catch (err) {
                console.error(err);
                toast.error("An unexpected error occurred");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>{isEditing ? "Edit Employee" : "New Employee"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? `Managing record for ${employee?.firstName} ${employee?.lastName}` : "Add a new member to the crew"}
                    </DialogDescription>
                </DialogHeader>

                <InnerForm
                    key={employee?.id || 'new'}
                    isEditing={isEditing}
                    initialData={employee}
                    onSubmit={handleSubmit}
                    isPending={isPending}
                />
            </DialogContent>
        </Dialog>
    );
}

// Separated to simplify state management reset
function InnerForm({ isEditing, initialData, onSubmit, isPending }: any) {
    const [data, setData] = useState(initialData || { status: "ACTIVE", role: "LABORER", payType: "HOURLY" });
    const [ec, setEc] = useState(() => {
        if (initialData?.emergencyContact) {
            try { return JSON.parse(initialData.emergencyContact); } catch { return {}; }
        }
        return {};
    });
    const [showSSN, setShowSSN] = useState(false);

    const handleChange = (field: string, val: any) => setData((prev: any) => ({ ...prev, [field]: val }));
    const handleEcChange = (field: string, val: any) => setEc((prev: any) => ({ ...prev, [field]: val }));

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        const finalData = {
            ...data,
            hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : null,
            email: data.email || null,
            phone: data.phone || null,
            emergencyContact: JSON.stringify(ec),
            // Ensure dates are dates if needed, or strings if action expects strings
            dob: data.dob ? new Date(data.dob) : null,
            hireDate: data.hireDate ? new Date(data.hireDate) : null
        };

        onSubmit(finalData);
    };

    return (
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto">
            <div className="p-6">
                <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[450px] mb-6">
                        <TabsTrigger value="personal">Personal</TabsTrigger>
                        <TabsTrigger value="role">Pay Rules</TabsTrigger>
                        <TabsTrigger value="secure">Tax & Union Class</TabsTrigger>
                    </TabsList>

                    <TabsContent value="personal" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>First Name</Label>
                                <Input required value={data.firstName || ''} onChange={e => handleChange('firstName', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <Input required value={data.lastName || ''} onChange={e => handleChange('lastName', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" value={data.email || ''} onChange={e => handleChange('email', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input type="tel" value={data.phone || ''} onChange={e => handleChange('phone', e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <Label>Date of Birth</Label>
                            <Input
                                type="date"
                                value={data.dob ? new Date(data.dob).toISOString().split('T')[0] : ''}
                                onChange={e => handleChange('dob', e.target.value)}
                            />
                        </div>

                        <div className="pt-4 border-t">
                            <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm text-muted-foreground"><Shield className="h-4 w-4" /> Emergency Contact</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Name</Label>
                                    <Input value={ec.name || ''} onChange={e => handleEcChange('name', e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Relationship</Label>
                                    <Input value={ec.relation || ''} onChange={e => handleEcChange('relation', e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Phone</Label>
                                    <Input value={ec.phone || ''} onChange={e => handleEcChange('phone', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="role" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Select value={data.role} onValueChange={v => handleChange('role', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FOREMAN">Foreman</SelectItem>
                                        <SelectItem value="OPERATOR">Operator</SelectItem>
                                        <SelectItem value="LABORER">Laborer</SelectItem>
                                        <SelectItem value="MECHANIC">Mechanic</SelectItem>
                                        <SelectItem value="OFFICE">Office</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={data.status} onValueChange={v => handleChange('status', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="TERMINATED">Terminated</SelectItem>
                                        <SelectItem value="LEAVE">Leave</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Pay Type</Label>
                                <Select value={data.payType} onValueChange={v => handleChange('payType', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="HOURLY">Hourly</SelectItem>
                                        <SelectItem value="SALARY">Salary</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Rate ($)</Label>
                                <Input type="number" step="0.01" value={data.hourlyRate || ''} onChange={e => handleChange('hourlyRate', e.target.value)} />
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm text-muted-foreground"><DollarSign className="h-4 w-4" /> QuickBooks Integration</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>QBO Employee ID</Label>
                                    <Input value={data.qboEmployeeId || ''} onChange={e => handleChange('qboEmployeeId', e.target.value)} placeholder="e.g. 55" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Default Earning Code</Label>
                                    <Input value={data.defaultEarningCode || ''} onChange={e => handleChange('defaultEarningCode', e.target.value)} placeholder="e.g. Regular Pay" />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="secure" className="space-y-4">
                        <div className="space-y-2 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-md border border-amber-200 dark:border-amber-800">
                            <Label className="flex items-center gap-2">
                                SSN
                                <Button type="button" variant="ghost" size="xs" className="h-6 w-6 p-0" onClick={() => setShowSSN(!showSSN)}>
                                    {showSSN ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </Button>
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    className="font-mono"
                                    placeholder="000-00-0000"
                                    value={data.ssn || ''}
                                    type={showSSN ? "text" : "password"}
                                    onChange={e => handleChange('ssn', e.target.value)}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Only enter if required for payroll. Stored encrypted.</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <div className="p-6 border-t bg-gray-50 dark:bg-slate-900 flex justify-end gap-3">
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Employee"}
                </Button>
            </div>
        </form>
    );
}
