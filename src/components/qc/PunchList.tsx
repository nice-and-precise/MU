'use client';

import { useState } from 'react';
import { createPunchItem, updatePunchItem } from '@/actions/qc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckSquare, Plus, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

interface PunchListProps {
    projectId: string;
    items: any[];
    users: any[]; // For assignment
}

export default function PunchList({ projectId, items, users }: PunchListProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        priority: 'MEDIUM',
        assigneeId: ''
    });

    const handleSubmit = async () => {
        if (!formData.title) return;
        setLoading(true);

        const res = await createPunchItem({
            projectId,
            title: formData.title,
            priority: formData.priority,
            assigneeId: formData.assigneeId || undefined
        });

        if (res.success) {
            setFormData({ title: '', priority: 'MEDIUM', assigneeId: '' });
            setShowForm(false);
            router.refresh();
        } else {
            alert('Failed to create punch item');
        }
        setLoading(false);
    };

    const toggleStatus = async (item: any) => {
        const newStatus = item.status === 'OPEN' ? 'COMPLETED' : 'OPEN';
        await updatePunchItem(item.id, {
            status: newStatus,
            completedAt: newStatus === 'COMPLETED' ? new Date() : undefined
        });
        router.refresh();
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5" /> Punch List
                </CardTitle>
                <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "secondary" : "default"} size="sm">
                    {showForm ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add Item</>}
                </Button>
            </CardHeader>
            <CardContent>
                {showForm && (
                    <div className="flex gap-2 mb-4 p-4 bg-slate-50 rounded-lg items-end">
                        <div className="flex-1">
                            <label className="text-xs font-medium">Item</label>
                            <Input
                                placeholder="Describe the issue..."
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="w-32">
                            <label className="text-xs font-medium">Priority</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                        <div className="w-40">
                            <label className="text-xs font-medium">Assignee</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formData.assigneeId}
                                onChange={e => setFormData({ ...formData, assigneeId: e.target.value })}
                            >
                                <option value="">Unassigned</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save'}
                        </Button>
                    </div>
                )}

                <div className="space-y-2">
                    {items.map(item => (
                        <div key={item.id} className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${item.status === 'COMPLETED' ? 'bg-slate-50 opacity-60' : 'hover:bg-slate-50'}`}>
                            <input
                                type="checkbox"
                                checked={item.status === 'COMPLETED'}
                                onChange={() => toggleStatus(item)}
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <div className="flex-1">
                                <p className={`font-medium ${item.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''}`}>
                                    {item.title}
                                </p>
                                <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                                    <Badge variant="outline" className={
                                        item.priority === 'HIGH' ? 'text-red-600 border-red-200 bg-red-50' :
                                            item.priority === 'MEDIUM' ? 'text-orange-600 border-orange-200 bg-orange-50' :
                                                'text-green-600 border-green-200 bg-green-50'
                                    }>
                                        {item.priority}
                                    </Badge>
                                    {item.assignee && (
                                        <span className="flex items-center gap-1">
                                            <UserIcon className="w-3 h-3" /> {item.assignee.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && !showForm && (
                        <p className="text-center text-muted-foreground py-8">No punch items found. Good job!</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
