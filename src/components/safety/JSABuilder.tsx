'use client';

import { useState } from 'react';
import { createJSA } from '@/actions/safety';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShieldAlert, Plus, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface JSABuilderProps {
    projectId: string;
}

export default function JSABuilder({ projectId }: JSABuilderProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [taskDescription, setTaskDescription] = useState('');
    const [hazards, setHazards] = useState<string[]>(['']);
    const [controls, setControls] = useState<string[]>(['']);

    const addHazard = () => setHazards([...hazards, '']);
    const updateHazard = (index: number, value: string) => {
        const newHazards = [...hazards];
        newHazards[index] = value;
        setHazards(newHazards);
    };
    const removeHazard = (index: number) => setHazards(hazards.filter((_, i) => i !== index));

    const addControl = () => setControls([...controls, '']);
    const updateControl = (index: number, value: string) => {
        const newControls = [...controls];
        newControls[index] = value;
        setControls(newControls);
    };
    const removeControl = (index: number) => setControls(controls.filter((_, i) => i !== index));

    const handleSubmit = async () => {
        if (!taskDescription) return;
        setLoading(true);

        const validHazards = hazards.filter(h => h.trim());
        const validControls = controls.filter(c => c.trim());

        const res = await createJSA({
            projectId,
            date: new Date(),
            taskDescription,
            hazards: validHazards,
            controls: validControls,
            signatures: [] // Placeholder for now
        });

        if (res.success) {
            setTaskDescription('');
            setHazards(['']);
            setControls(['']);
            router.refresh();
        } else {
            alert('Failed to create JSA');
        }
        setLoading(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5" /> New JSA
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Task Description</label>
                    <Input
                        placeholder="e.g. Excavating Trench for Conduit"
                        value={taskDescription}
                        onChange={e => setTaskDescription(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Hazards</label>
                        {hazards.map((h, i) => (
                            <div key={i} className="flex gap-2 mb-2">
                                <Input value={h} onChange={e => updateHazard(i, e.target.value)} placeholder="Hazard..." />
                                <Button variant="ghost" size="icon" onClick={() => removeHazard(i)}><Trash className="w-4 h-4 text-red-500" /></Button>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={addHazard}><Plus className="w-4 h-4 mr-2" /> Add Hazard</Button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Controls</label>
                        {controls.map((c, i) => (
                            <div key={i} className="flex gap-2 mb-2">
                                <Input value={c} onChange={e => updateControl(i, e.target.value)} placeholder="Control..." />
                                <Button variant="ghost" size="icon" onClick={() => removeControl(i)}><Trash className="w-4 h-4 text-red-500" /></Button>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={addControl}><Plus className="w-4 h-4 mr-2" /> Add Control</Button>
                    </div>
                </div>

                <Button onClick={handleSubmit} disabled={loading || !taskDescription} className="w-full">
                    {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Submit JSA'}
                </Button>
            </CardContent>
        </Card>
    );
}
