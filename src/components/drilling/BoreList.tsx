'use client';

import { useState } from 'react';
import { createBore } from '@/actions/drilling';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Loader2, ArrowRight, Activity } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BoreListProps {
    projectId: string;
    bores: any[];
}

export default function BoreList({ projectId, bores }: BoreListProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [newBoreName, setNewBoreName] = useState('');
    const [showInput, setShowInput] = useState(false);

    const handleCreate = async () => {
        if (!newBoreName) return;
        setLoading(true);
        const res = await createBore({ projectId, name: newBoreName });
        if (res.success) {
            setNewBoreName('');
            setShowInput(false);
            router.refresh();
        } else {
            alert('Failed to create bore');
        }
        setLoading(false);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Production Bores</CardTitle>
                <Button onClick={() => setShowInput(!showInput)} variant={showInput ? "secondary" : "default"}>
                    {showInput ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> New Bore</>}
                </Button>
            </CardHeader>
            <CardContent>
                {showInput && (
                    <div className="flex gap-2 mb-4 p-4 bg-slate-50 rounded-lg">
                        <Input
                            placeholder="Bore Name (e.g. Mainline)"
                            value={newBoreName}
                            onChange={e => setNewBoreName(e.target.value)}
                        />
                        <Button onClick={handleCreate} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Create'}
                        </Button>
                    </div>
                )}

                <div className="space-y-2">
                    {bores.map(bore => (
                        <div key={bore.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${bore.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                    <Activity className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-medium">{bore.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {bore.rodPasses?.length || 0} Rods • {((bore.rodPasses?.length || 0) * 15).toLocaleString()} ft (approx)
                                    </p>
                                </div>
                            </div>
                            <Link href={`/dashboard/projects/${projectId}/production/${bore.id}`}>
                                <Button variant="outline" size="sm">
                                    Open Logger <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    ))}
                    {bores.length === 0 && !showInput && (
                        <p className="text-center text-muted-foreground py-8">No bores started yet.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
