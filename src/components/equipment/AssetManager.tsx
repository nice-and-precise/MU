'use client';

import { useState } from 'react';
import { createAsset } from '@/actions/equipment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Loader2, Truck, Wrench } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface AssetManagerProps {
    assets: any[];
}

export default function AssetManager({ assets }: AssetManagerProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'Excavator',
        model: '',
        serialNumber: '',
        status: 'AVAILABLE'
    });

    const handleSubmit = async () => {
        if (!formData.name) return;
        setLoading(true);
        const res = await createAsset(formData);

        if (res.success) {
            setFormData({ name: '', type: 'Excavator', model: '', serialNumber: '', status: 'AVAILABLE' });
            setShowForm(false);
            router.refresh();
        } else {
            alert('Failed to create asset');
        }
        setLoading(false);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Asset Manager</CardTitle>
                <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "secondary" : "default"}>
                    {showForm ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add Asset</>}
                </Button>
            </CardHeader>
            <CardContent>
                {showForm && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 mb-6 p-4 bg-slate-50 rounded-lg">
                        <Input
                            placeholder="Asset Name (e.g. Unit 101)"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="Excavator">Excavator</option>
                            <option value="Drill">Drill</option>
                            <option value="Truck">Truck</option>
                            <option value="Trailer">Trailer</option>
                            <option value="Locator">Locator</option>
                            <option value="Other">Other</option>
                        </select>
                        <Input
                            placeholder="Model"
                            value={formData.model}
                            onChange={e => setFormData({ ...formData, model: e.target.value })}
                        />
                        <Input
                            placeholder="Serial Number"
                            value={formData.serialNumber}
                            onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                        />
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save'}
                        </Button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assets.map(asset => (
                        <div key={asset.id} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
                                <Truck className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold">{asset.name}</h3>
                                    <StatusBadge status={asset.status} />
                                </div>
                                <p className="text-sm text-muted-foreground">{asset.type} • {asset.model}</p>
                                <p className="text-xs text-gray-400">SN: {asset.serialNumber}</p>
                            </div>
                        </div>
                    ))}
                    {assets.length === 0 && !showForm && (
                        <p className="col-span-full text-center text-muted-foreground py-8">No assets found.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
