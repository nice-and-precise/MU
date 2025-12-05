'use client';

import { useState } from 'react';
import { createTimeCard } from '@/actions/labor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TimeCardFormProps {
    employees: any[];
    projectId: string;
}

export default function TimeCardForm({ employees, projectId }: TimeCardFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        employeeId: '',
        date: new Date().toISOString().split('T')[0],
        hours: '',
        code: 'Drilling',
        notes: ''
    });

    const handleSubmit = async () => {
        if (!formData.employeeId || !formData.hours) return;
        setLoading(true);

        const res = await createTimeCard({
            projectId,
            employeeId: formData.employeeId,
            date: new Date(formData.date),
            hours: Number(formData.hours),
            code: formData.code,
            notes: formData.notes
        });

        if (res?.data) {
            setFormData(prev => ({ ...prev, hours: '', notes: '' })); // Keep employee/date selected
            router.refresh();
        } else {
            alert(res?.error || 'Failed to create time card');
        }
        setLoading(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Log Hours
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Employee</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={formData.employeeId}
                            onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                        >
                            <option value="">Select Employee...</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Date</label>
                        <Input
                            type="date"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Hours</label>
                        <Input
                            type="number"
                            value={formData.hours}
                            onChange={e => setFormData({ ...formData, hours: e.target.value })}
                            placeholder="e.g. 8.5"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Cost Code</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={formData.code}
                            onChange={e => setFormData({ ...formData, code: e.target.value })}
                        >
                            <option value="Drilling">Drilling</option>
                            <option value="Mobilization">Mobilization</option>
                            <option value="Potholing">Potholing</option>
                            <option value="Restoration">Restoration</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <Input
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Optional notes..."
                    />
                </div>
                <Button onClick={handleSubmit} disabled={loading || !formData.employeeId} className="w-full">
                    {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Submit Time Card'}
                </Button>
            </CardContent>
        </Card>
    );
}
