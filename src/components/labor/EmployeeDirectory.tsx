'use client';

import { useState, useMemo } from 'react';
import { createEmployee } from '@/actions/employees';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Loader2, User, HardHat, Search, Filter, Phone, Mail, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EmployeeDirectoryProps {
    employees: any[];
    userRole: string;
}

export default function EmployeeDirectory({ employees, userRole }: EmployeeDirectoryProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        role: 'Laborer',
        hourlyRate: '',
        photoUrl: ''
    });

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const matchesSearch =
                emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.email?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesRole = roleFilter === 'ALL' || emp.role === roleFilter;

            return matchesSearch && matchesRole;
        });
    }, [employees, searchQuery, roleFilter]);

    const roles = Array.from(new Set(employees.map(e => e.role))).filter(Boolean);

    const handleSubmit = async () => {
        if (!formData.firstName || !formData.lastName) return;
        setLoading(true);
        const res = await createEmployee({
            ...formData,
            hourlyRate: Number(formData.hourlyRate)
        });

        if (res.success) {
            setFormData({ firstName: '', lastName: '', role: 'Laborer', hourlyRate: '', photoUrl: '' });
            setShowForm(false);
            router.refresh();
        } else {
            alert('Failed to create employee');
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search employees..."
                            className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-[180px] bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="All Roles" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Roles</SelectItem>
                            {roles.map(role => (
                                <SelectItem key={role} value={role}>{role}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {userRole === 'OWNER' && (
                    <Button
                        onClick={() => setShowForm(!showForm)}
                        className="w-full md:w-auto bg-[#003366] hover:bg-[#002244] text-white shadow-md dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                        {showForm ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add Employee</>}
                    </Button>
                )}
            </div>

            {/* Quick Add Form */}
            {showForm && (
                <Card className="animate-in fade-in slide-in-from-top-4 border-slate-200 dark:border-slate-800 shadow-lg">
                    <CardContent className="p-6">
                        <h3 className="font-bold mb-4 text-lg">New Employee Details</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <Input
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                            />
                            <Input
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                            />
                            <Select
                                value={formData.role}
                                onValueChange={v => setFormData({ ...formData, role: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Laborer">Laborer</SelectItem>
                                    <SelectItem value="Operator">Operator</SelectItem>
                                    <SelectItem value="Foreman">Foreman</SelectItem>
                                    <SelectItem value="Truck Driver">Truck Driver</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input
                                placeholder="Rate ($/hr)"
                                value={formData.hourlyRate}
                                onChange={e => setFormData({ ...formData, hourlyRate: e.target.value })}
                            />
                            <Button onClick={handleSubmit} disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white">
                                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save Employee'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Employee Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredEmployees.map(emp => (
                    <div
                        key={emp.id}
                        className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 cursor-pointer overflow-hidden"
                        onClick={() => router.push(`/dashboard/labor/${emp.id}`)}
                    >
                        {/* Header Background Gradient Accent */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex flex-col items-center mb-4">
                            <div className="relative mb-3">
                                <div className="h-20 w-20 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-white dark:border-slate-700 shadow-sm group-hover:scale-105 transition-transform">
                                    {emp.photoUrl ? (
                                        <img src={emp.photoUrl} alt={`${emp.firstName} ${emp.lastName}`} className="h-full w-full object-cover" />
                                    ) : emp.user?.avatar ? (
                                        <img src={emp.user.avatar} alt={`${emp.firstName} ${emp.lastName}`} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="text-slate-400">
                                            {emp.role === 'Foreman' ? <HardHat className="w-10 h-10" /> : <User className="w-10 h-10" />}
                                        </div>
                                    )}
                                </div>
                                <span className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 ${emp.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-300'}`} />
                            </div>

                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">{emp.firstName} {emp.lastName}</h3>
                            <StatusBadge status={emp.role} />
                        </div>

                        <div className="space-y-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Phone className="w-3 h-3" /> Mobile
                                </span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">{emp.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Mail className="w-3 h-3" /> Email
                                </span>
                                <span className="font-medium text-slate-700 dark:text-slate-300 max-w-[120px] truncate" title={emp.email}>{emp.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <MapPin className="w-3 h-3" /> Rate
                                </span>
                                {userRole === 'OWNER' && emp.hourlyRate ? (
                                    <span className="font-medium text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                        ${emp.hourlyRate}/hr
                                    </span>
                                ) : (
                                    <span className="text-xs text-muted-foreground italic">Hidden</span>
                                )}
                            </div>
                        </div>

                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
                                <User className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {filteredEmployees.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center min-h-[300px] text-muted-foreground">
                        <User className="h-16 w-16 text-slate-200 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">No employees found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                )}
            </div>
        </div>
    );
}
