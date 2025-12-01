'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateEstimate, addLineItem, updateLineItem, deleteLineItem } from '@/actions/estimating';
import { generateEstimatePDF } from '@/lib/pdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Save, ArrowLeft, Loader2, Download } from 'lucide-react';
import Link from 'next/link';

interface EstimateEditorProps {
    estimate: any;
}

export default function EstimateEditor({ estimate }: EstimateEditorProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [header, setHeader] = useState({
        name: estimate.name,
        customerName: estimate.customerName || '',
        status: estimate.status,
    });

    // Header Updates
    const handleHeaderSave = async () => {
        setLoading(true);
        await updateEstimate(estimate.id, header);
        setLoading(false);
        router.refresh();
    };

    // Line Item Management
    const [newLine, setNewLine] = useState({ description: '', quantity: 1, unit: 'LS', unitCost: 0, markup: 0.15 });

    const handleAddLine = async () => {
        if (!newLine.description) return;
        setLoading(true);
        await addLineItem(estimate.id, newLine);
        setNewLine({ description: '', quantity: 1, unit: 'LS', unitCost: 0, markup: 0.15 }); // Reset
        setLoading(false);
        router.refresh();
    };

    const handleDeleteLine = async (id: string) => {
        if (!confirm('Delete this line item?')) return;
        setLoading(true);
        await deleteLineItem(id);
        setLoading(false);
        router.refresh();
    };

    const handleUpdateLine = async (id: string, field: string, value: any) => {
        // Optimistic update could go here, for now just server action
        await updateLineItem(id, { [field]: value });
        router.refresh();
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Top Bar */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/estimating">
                        <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
                    </Link>
                    <h1 className="text-2xl font-bold">{estimate.name}</h1>
                    <span className="text-muted-foreground text-sm">#{estimate.id.slice(-6)}</span>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => generateEstimatePDF(estimate)}>
                        <Download className="w-4 h-4 mr-2" /> Export PDF
                    </Button>
                    <Button variant="outline" onClick={handleHeaderSave} disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Header
                    </Button>
                </div>
            </div>

            {/* Header Info */}
            <Card>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <Label>Estimate Name</Label>
                        <Input value={header.name} onChange={e => setHeader({ ...header, name: e.target.value })} />
                    </div>
                    <div>
                        <Label>Customer</Label>
                        <Input value={header.customerName} onChange={e => setHeader({ ...header, customerName: e.target.value })} />
                    </div>
                    <div>
                        <Label>Status</Label>
                        <Select value={header.status} onValueChange={val => setHeader({ ...header, status: val })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DRAFT">Draft</SelectItem>
                                <SelectItem value="SENT">Sent</SelectItem>
                                <SelectItem value="WON">Won</SelectItem>
                                <SelectItem value="LOST">Lost</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Line Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40%]">Description</TableHead>
                                <TableHead className="w-[10%]">Qty</TableHead>
                                <TableHead className="w-[10%]">Unit</TableHead>
                                <TableHead className="w-[15%]">Unit Cost</TableHead>
                                <TableHead className="w-[10%]">Markup %</TableHead>
                                <TableHead className="w-[15%] text-right">Total</TableHead>
                                <TableHead className="w-[5%]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {estimate.lines.map((line: any) => (
                                <TableRow key={line.id}>
                                    <TableCell>
                                        <Input
                                            value={line.description}
                                            onChange={e => handleUpdateLine(line.id, 'description', e.target.value)}
                                            className="border-none shadow-none focus-visible:ring-0 px-0"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={line.quantity}
                                            onChange={e => handleUpdateLine(line.id, 'quantity', Number(e.target.value))}
                                            className="w-20"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            value={line.unit}
                                            onChange={e => handleUpdateLine(line.id, 'unit', e.target.value)}
                                            className="w-16"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={line.unitCost}
                                            onChange={e => handleUpdateLine(line.id, 'unitCost', Number(e.target.value))}
                                            className="w-24"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={line.markup * 100}
                                            onChange={e => handleUpdateLine(line.id, 'markup', Number(e.target.value) / 100)}
                                            className="w-16"
                                        />
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        ${line.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteLine(line.id)}>
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {/* Add New Line Row */}
                            <TableRow className="bg-slate-50">
                                <TableCell>
                                    <Input placeholder="New Item Description" value={newLine.description} onChange={e => setNewLine({ ...newLine, description: e.target.value })} />
                                </TableCell>
                                <TableCell>
                                    <Input type="number" value={newLine.quantity} onChange={e => setNewLine({ ...newLine, quantity: Number(e.target.value) })} />
                                </TableCell>
                                <TableCell>
                                    <Input value={newLine.unit} onChange={e => setNewLine({ ...newLine, unit: e.target.value })} />
                                </TableCell>
                                <TableCell>
                                    <Input type="number" placeholder="Cost" value={newLine.unitCost} onChange={e => setNewLine({ ...newLine, unitCost: Number(e.target.value) })} />
                                </TableCell>
                                <TableCell>
                                    <Input type="number" value={newLine.markup * 100} onChange={e => setNewLine({ ...newLine, markup: Number(e.target.value) / 100 })} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" onClick={handleAddLine} disabled={!newLine.description || loading}>
                                        <Plus className="w-4 h-4 mr-2" /> Add
                                    </Button>
                                </TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Totals */}
            <div className="flex justify-end">
                <Card className="w-1/3">
                    <CardContent className="p-6 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal (Cost)</span>
                            <span>${estimate.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-sm text-green-600">
                            <span>Markup</span>
                            <span>+${estimate.markupAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>${estimate.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
