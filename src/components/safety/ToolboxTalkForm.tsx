'use client';

import { useState } from 'react';
import { createSafetyMeeting } from '@/actions/safety';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ToolboxTalkFormProps {
    projectId: string;
}

export default function ToolboxTalkForm({ projectId }: ToolboxTalkFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        topic: '',
        attendees: '', // Comma separated for now
        notes: ''
    });

    const handleSubmit = async () => {
        if (!formData.topic || !formData.attendees) return;
        setLoading(true);

        const attendeeList = formData.attendees.split(',').map(s => s.trim()).filter(Boolean);

        const res = await createSafetyMeeting({
            projectId,
            date: new Date(formData.date),
            topic: formData.topic,
            attendees: attendeeList,
            notes: formData.notes
        });

        if (res.success) {
            setFormData({ date: new Date().toISOString().split('T')[0], topic: '', attendees: '', notes: '' });
            router.refresh();
        } else {
            alert('Failed to create safety meeting');
        }
        setLoading(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" /> Toolbox Talk
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Date</label>
                        <Input
                            type="date"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Topic</label>
                        <Input
                            placeholder="e.g. PPE, Trench Safety"
                            value={formData.topic}
                            onChange={e => setFormData({ ...formData, topic: e.target.value })}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Attendees (comma separated)</label>
                    <Textarea
                        placeholder="John Doe, Jane Smith..."
                        value={formData.attendees}
                        onChange={e => setFormData({ ...formData, attendees: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <Textarea
                        placeholder="Discussion points..."
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    />
                </div>
                <Button onClick={handleSubmit} disabled={loading || !formData.topic} className="w-full">
                    {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Log Meeting'}
                </Button>
            </CardContent>
        </Card>
    );
}
