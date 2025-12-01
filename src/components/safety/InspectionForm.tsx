'use client';

import { useState } from 'react';
import { createInspection } from '@/actions/safety';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ClipboardCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface InspectionFormProps {
    projectId: string;
    assets: any[];
}

const VEHICLE_CHECKLIST = [
    'Brakes', 'Lights', 'Tires', 'Fluids', 'Horn', 'Mirrors', 'Seatbelts'
];

export default function InspectionForm({ projectId, assets }: InspectionFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [assetId, setAssetId] = useState('');
    const [type, setType] = useState('Vehicle');
    const [checklist, setChecklist] = useState<Record<string, boolean>>(
        VEHICLE_CHECKLIST.reduce((acc, item) => ({ ...acc, [item]: true }), {})
    );

    const toggleItem = (item: string) => {
        setChecklist(prev => ({ ...prev, [item]: !prev[item] }));
    };

    const handleSubmit = async () => {
        setLoading(true);

        const items = Object.entries(checklist).map(([name, passed]) => ({ name, passed }));
        const passed = items.every(i => i.passed);

        const res = await createInspection({
            projectId,
            assetId: assetId || undefined,
            date: new Date(),
            type,
            items,
            passed
        });

        if (res.success) {
            setAssetId('');
            router.refresh();
        } else {
            alert('Failed to submit inspection');
        }
        setLoading(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5" /> Inspection
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={type}
                            onChange={e => setType(e.target.value)}
                        >
                            <option value="Vehicle">Vehicle / Equipment</option>
                            <option value="Site">Site Safety</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Asset (Optional)</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={assetId}
                            onChange={e => setAssetId(e.target.value)}
                        >
                            <option value="">Select Asset...</option>
                            {assets.map(a => (
                                <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium">Checklist</label>
                    <div className="grid grid-cols-2 gap-2">
                        {VEHICLE_CHECKLIST.map(item => (
                            <div key={item} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={checklist[item]}
                                    onChange={() => toggleItem(item)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className={checklist[item] ? 'text-green-700' : 'text-red-600 font-bold'}>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <Button onClick={handleSubmit} disabled={loading} className="w-full">
                    {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Submit Inspection'}
                </Button>
            </CardContent>
        </Card>
    );
}
