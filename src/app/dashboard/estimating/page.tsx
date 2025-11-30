
'use client';

import { useState, useEffect } from 'react';
import { getEstimates, createEstimate } from '@/actions/estimating';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function EstimatingPage() {
    const [estimates, setEstimates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newEstimateName, setNewEstimateName] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadEstimates();
    }, []);

    async function loadEstimates() {
        const res = await getEstimates();
        if (res.success && res.data) {
            setEstimates(res.data);
        }
        setLoading(false);
    }

    async function handleCreate() {
        if (!newEstimateName) return;
        const res = await createEstimate({ name: newEstimateName });
        if (res.success && res.data) {
            router.push(`/dashboard/estimating/${res.data.id}`);
        }
    }

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Estimating</h1>
                    <p className="text-muted-foreground">Manage bids and proposals.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                            <Plus className="mr-2 h-4 w-4" /> New Estimate
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Estimate</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Estimate Name</Label>
                                <Input
                                    placeholder="e.g. Main St. Fiber Crossing"
                                    value={newEstimateName}
                                    onChange={(e) => setNewEstimateName(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleCreate} className="w-full">Create & Edit</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {estimates.map((est) => (
                    <Link key={est.id} href={`/dashboard/estimating/${est.id}`}>
                        <Card className="hover:border-yellow-500 transition-colors cursor-pointer">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {est.status}
                                </CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{est.name}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {est.project ? `Project: ${est.project.name}` : 'No Project Linked'}
                                </p>
                                <div className="mt-4 flex justify-between items-end">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Total</p>
                                        <p className="text-lg font-bold text-green-600">
                                            ${est.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-gray-400" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}

                {estimates.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg text-muted-foreground">
                        <FileText className="h-12 w-12 mb-4 opacity-20" />
                        <p>No estimates found. Create one to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
