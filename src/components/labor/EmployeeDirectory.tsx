'use client';

import { useState } from 'react';
import { createEmployee } from '@/actions/employees';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Loader2, User, HardHat } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmployeeDirectoryProps {
    employees: any[];
}

export default function EmployeeDirectory({ employees }: EmployeeDirectoryProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        role: 'Laborer',
        hourlyRate: ''
    });

    const handleSubmit = async () => {
        if (!formData.firstName || !formData.lastName) return;
        setLoading(true);
        const res = await createEmployee({
            ...formData,
            hourlyRate: Number(formData.hourlyRate)
        });

        if (res.success) {
            setFormData({ firstName: '', lastName: '', role: 'Laborer', hourlyRate: '' });
            setShowForm(false);
            router.refresh();
        } else {
            alert('Failed to create employee');
        }
        setLoading(false);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Employee Directory</CardTitle>
                <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "secondary" : "default"}>
                    {showForm ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add Employee</>}
                </Button>
            </CardHeader>
            <CardContent>
                {showForm && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6 p-4 bg-slate-50 rounded-lg">
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
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="Laborer">Laborer</option>
                            <option value="Operator">Operator</option>
                            <option value="Foreman">Foreman</option>
                            <option value="Truck Driver">Truck Driver</option>
                        </select>
                        <Input
                            type="number"
                            placeholder="Rate ($/hr)"
                            value={formData.hourlyRate}
                            onChange={e => setFormData({ ...formData, hourlyRate: e.target.value })}
                        />
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save'}
                        </Button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {employees.map(emp => (
                        <div key={emp.id} className="relative group p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
                                    {emp.user?.avatar ? (
                                        <img src={emp.user.avatar} alt={`${emp.firstName} ${emp.lastName}`} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="text-slate-400">
                                            {emp.role === 'Foreman' ? <HardHat className="w-6 h-6" /> : <User className="w-6 h-6" />}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold">{emp.firstName} {emp.lastName}</h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>{emp.role}</span>
                                        <span>•</span>
                                        <span>${emp.hourlyRate}/hr</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${emp.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {emp.status || 'ACTIVE'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => router.push(`/dashboard/labor/${emp.id}`)}
                            >
                                Edit
                            </Button>
                        </div>
                    ))}
                    {employees.length === 0 && !showForm && (
                        <p className="col-span-full text-center text-muted-foreground py-8">No employees found.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
