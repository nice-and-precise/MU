
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

    async function updateStatus(status: string) {
        // Mock status update for now, or implement action
        alert(`Status update to ${status} coming soon!`);
    }

    if (loading) return <div className="p-8">Loading...</div>;
    if (!estimate) return <div className="p-8">Estimate not found</div>;

    // Group lines by category
    const groupedLines = estimate.lines.reduce((acc: any, line: any) => {
        const category = line.unit === 'HR' ? 'Labor' : line.unit === 'DAY' ? 'Equipment' : 'Material';
        if (!acc[category]) acc[category] = [];
        acc[category].push(line);
        return acc;
    }, {} as Record<string, typeof estimate.lines>);

    const calculateCategoryTotal = (lines: typeof estimate.lines) => lines.reduce((sum: any, line: any) => sum + line.total, 0);

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Link href="/dashboard/estimating" className="hover:text-blue-600">Estimates</Link>
                        <span>/</span>
                        <span>{estimate.project.name}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{estimate.name}</h1>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => alert("Export PDF feature coming soon!")}>
                        <Download className="mr-2 h-4 w-4" />
                        Export PDF
                    </Button>
                    <Button
                        className={estimate.status === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : ''}
                        onClick={() => updateStatus(estimate.status === 'DRAFT' ? 'SUBMITTED' : 'APPROVED')}
                    >
                        {estimate.status === 'DRAFT' ? 'Submit for Review' : estimate.status === 'SUBMITTED' ? 'Approve Estimate' : 'Approved'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Line Items */}
                <div className="lg:col-span-2 space-y-6">
                    {Object.entries(groupedLines).map(([category, lines]: [string, any]) => (
                        <Card key={category}>
                            <CardHeader className="bg-gray-50 dark:bg-gray-800/50 pb-2">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg font-bold text-gray-700 dark:text-gray-200">{category}</CardTitle>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        ${calculateCategoryTotal(lines).toLocaleString()}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">#</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="text-right">Qty</TableHead>
                                            <TableHead className="text-right">Unit</TableHead>
                                            <TableHead className="text-right">Cost</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {lines.map((line: any) => (
                                            <TableRow key={line.id}>
                                                <TableCell>{line.lineNumber}</TableCell>
                                                <TableCell className="font-medium">{line.description}</TableCell>
                                                <TableCell className="text-right">{line.quantity}</TableCell>
                                                <TableCell className="text-right">{line.unit}</TableCell>
                                                <TableCell className="text-right">${line.unitCost.toFixed(2)}</TableCell>
                                                <TableCell className="text-right font-bold">${line.total.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Add New Line Form */}
                    <Card className="border-dashed border-2">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-base">Add Line Item</CardTitle>
                                <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="sm">
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
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Description</label>
                                        <Input
                                            value={newLine.description}
                                            onChange={(e) => setNewLine({ ...newLine, description: e.target.value })}
                                            placeholder="Item description"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Quantity</label>
                                            <Input
                                                type="number"
                                                value={newLine.quantity}
                                                onChange={(e) => setNewLine({ ...newLine, quantity: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Unit</label>
                                            <Input
                                                value={newLine.unit}
                                                onChange={(e) => setNewLine({ ...newLine, unit: e.target.value })}
                                                placeholder="HR, EA, LF"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Unit Cost ($)</label>
                                        <Input
                                            type="number"
                                            value={newLine.unitCost}
                                            onChange={(e) => setNewLine({ ...newLine, unitCost: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Markup (%)</label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={newLine.markup}
                                            onChange={(e) => setNewLine({ ...newLine, markup: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button onClick={handleAddLine} className="w-full">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Item
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Summary Sidebar */}
                <div className="space-y-6">
                    <Card className="bg-slate-900 text-white border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center text-white">
                                <Calculator className="mr-2 h-5 w-5" /> Estimate Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm text-slate-400">
                                <span>Subtotal</span>
                                <span>${estimate.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-400">
                                <span>Markup</span>
                                <span className="text-green-400">+${estimate.markupAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-400">
                                <span>Overhead (10%)</span>
                                <span>${(estimate.total * 0.1).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-400">
                                <span>Profit (15%)</span>
                                <span>${(estimate.total * 0.15).toLocaleString()}</span>
                            </div>
                            <div className="pt-4 border-t border-slate-700 flex justify-between items-end">
                                <span className="font-bold text-lg">Total Bid</span>
                                <span className="font-bold text-2xl text-green-400">${estimate.total.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}


