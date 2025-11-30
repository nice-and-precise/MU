
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getEstimate, addEstimateLine, generateEstimateFromBore, getProjectsForEstimating } from '@/actions/estimating';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Download, ArrowLeft, Calculator } from 'lucide-react';
import Link from 'next/link';

export default function EstimateDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [estimate, setEstimate] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Add Line State
    const [isAddLineOpen, setIsAddLineOpen] = useState(false);
    const [newLine, setNewLine] = useState({
        description: '',
        quantity: 1,
        unit: 'LS',
        unitCost: 0,
        markup: 0.15
    });

    // Import Assembly State
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [selectedBoreId, setSelectedBoreId] = useState<string>('');

    useEffect(() => {
        loadEstimate();
    }, [id]);

    useEffect(() => {
        if (isImportOpen) {
            loadProjects();
        }
    }, [isImportOpen]);

    async function loadEstimate() {
        const res = await getEstimate(id);
        if (res.success && res.data) {
            setEstimate(res.data);
        }
        setLoading(false);
    }

    async function loadProjects() {
        const res = await getProjectsForEstimating();
        if (res.success && res.data) {
            setProjects(res.data);
        }
    }

    async function handleAddLine() {
        await addEstimateLine({
            estimateId: id,
            ...newLine
        });
        setIsAddLineOpen(false);
        setNewLine({ description: '', quantity: 1, unit: 'LS', unitCost: 0, markup: 0.15 });
        loadEstimate();
    }

    async function handleImportAssembly() {
        if (!selectedBoreId) return;
        await generateEstimateFromBore(id, selectedBoreId);
        setIsImportOpen(false);
        loadEstimate();
    }

    if (loading) return <div className="p-8">Loading...</div>;
    if (!estimate) return <div className="p-8">Estimate not found</div>;

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center space-x-4 mb-6">
                <Link href="/dashboard/estimating">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">{estimate.name}</h1>
                    <p className="text-muted-foreground text-sm">
                        {estimate.status} • Created {new Date(estimate.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Line Items</CardTitle>
                        <div className="flex space-x-2">
                            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Download className="mr-2 h-4 w-4" /> Import Assembly
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Import from Bore Plan</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Select Project</Label>
                                            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choose project..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {projects.map(p => (
                                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {selectedProject && (
                                            <div className="space-y-2">
                                                <Label>Select Bore</Label>
                                                <Select value={selectedBoreId} onValueChange={setSelectedBoreId}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Choose bore..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {selectedProject.bores.map((b: any) => (
                                                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                        <Button onClick={handleImportAssembly} disabled={!selectedBoreId} className="w-full">
                                            Generate Items
                                        </Button>
                                        <p className="text-xs text-muted-foreground text-center">
                                            This will calculate pipe, labor, rig time, and fluids based on the bore engineering plan.
                                        </p>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={isAddLineOpen} onOpenChange={setIsAddLineOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm">
                                        <Plus className="mr-2 h-4 w-4" /> Add Line
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Line Item</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Input
                                                value={newLine.description}
                                                onChange={(e) => setNewLine({ ...newLine, description: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Quantity</Label>
                                                <Input
                                                    type="number"
                                                    value={newLine.quantity}
                                                    onChange={(e) => setNewLine({ ...newLine, quantity: parseFloat(e.target.value) })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Unit</Label>
                                                <Input
                                                    value={newLine.unit}
                                                    onChange={(e) => setNewLine({ ...newLine, unit: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Unit Cost ($)</Label>
                                                <Input
                                                    type="number"
                                                    value={newLine.unitCost}
                                                    onChange={(e) => setNewLine({ ...newLine, unitCost: parseFloat(e.target.value) })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Markup (%)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={newLine.markup}
                                                    onChange={(e) => setNewLine({ ...newLine, markup: parseFloat(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                        <Button onClick={handleAddLine} className="w-full">Add Item</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">#</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead className="text-right">Unit</TableHead>
                                    <TableHead className="text-right">Unit Cost</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {estimate.lines.map((line: any) => (
                                    <TableRow key={line.id}>
                                        <TableCell>{line.lineNumber}</TableCell>
                                        <TableCell className="font-medium">{line.description}</TableCell>
                                        <TableCell className="text-right">{line.quantity}</TableCell>
                                        <TableCell className="text-right">{line.unit}</TableCell>
                                        <TableCell className="text-right">${line.unitCost.toFixed(2)}</TableCell>
                                        <TableCell className="text-right font-bold">${line.total.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                                {estimate.lines.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                            No line items. Add one or import from a bore plan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-gray-50 dark:bg-gray-800 border-l-4 border-yellow-500">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Calculator className="mr-2 h-5 w-5" /> Estimate Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal Cost</span>
                                <span>${estimate.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Markup</span>
                                <span className="text-green-600">+${estimate.markupAmount.toFixed(2)}</span>
                            </div>
                            <div className="pt-4 border-t flex justify-between items-center">
                                <span className="font-bold text-lg">Total Bid</span>
                                <span className="font-bold text-2xl">${estimate.total.toFixed(2)}</span>
                            </div>
                            <Button className="w-full mt-4" variant="default">
                                Finalize & Export
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
