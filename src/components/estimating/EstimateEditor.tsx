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
import { Plus, Trash2, Save, ArrowLeft, Loader2, Download, Package, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getInventoryItems } from '@/actions/inventory';

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

    // Inventory & Assemblies
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [inventoryItems, setInventoryItems] = useState<any[]>([]);
    const [loadingInventory, setLoadingInventory] = useState(false);

    const handleOpenInventory = async () => {
        setIsInventoryOpen(true);
        if (inventoryItems.length === 0) {
            setLoadingInventory(true);
            const res = await getInventoryItems();
            if (res.success && res.data) {
                setInventoryItems(res.data);
            }
            setLoadingInventory(false);
        }
    };

    const handleAddFromInventory = (item: any) => {
        setNewLine({
            description: item.name,
            quantity: 1,
            unit: item.unit,
            unitCost: item.costPerUnit || 0,
            markup: 0.15
        });
        setIsInventoryOpen(false);
    };

    const handleAddAssembly = async (type: 'BORE_100' | 'BORE_500' | 'POTHOLE') => {
        setLoading(true);
        const assemblies = {
            'BORE_100': [
                { description: 'Directional Bore - 2" HDPE', quantity: 100, unit: 'LF', unitCost: 12.00, markup: 0.20 },
                { description: 'Bore Crew (Foreman, Op, Labor)', quantity: 4, unit: 'HR', unitCost: 225.00, markup: 0.15 },
                { description: 'Drill Rig (D24x40)', quantity: 4, unit: 'HR', unitCost: 150.00, markup: 0.15 },
            ],
            'BORE_500': [
                { description: 'Directional Bore - 4" HDPE', quantity: 500, unit: 'LF', unitCost: 18.00, markup: 0.25 },
                { description: 'Bore Crew (Foreman, Op, Labor)', quantity: 20, unit: 'HR', unitCost: 225.00, markup: 0.15 },
                { description: 'Drill Rig (D40x55)', quantity: 20, unit: 'HR', unitCost: 220.00, markup: 0.15 },
                { description: 'Vac Truck Support', quantity: 20, unit: 'HR', unitCost: 110.00, markup: 0.15 },
            ],
            'POTHOLE': [
                { description: 'Vacuum Pothole (0-6ft)', quantity: 1, unit: 'EA', unitCost: 350.00, markup: 0.20 },
                { description: 'Vac Truck', quantity: 2, unit: 'HR', unitCost: 110.00, markup: 0.15 },
                { description: 'Laborer', quantity: 2, unit: 'HR', unitCost: 45.00, markup: 0.15 },
            ]
        };

        const items = assemblies[type];
        for (const item of items) {
            await addLineItem(estimate.id, item);
        }
        setLoading(false);
        router.refresh();
    };

    // Cost Database
    const [isCostDbOpen, setIsCostDbOpen] = useState(false);
    const [costItems, setCostItems] = useState<any[]>([]);
    const [loadingCostDb, setLoadingCostDb] = useState(false);

    const handleOpenCostDb = async () => {
        setIsCostDbOpen(true);
        if (costItems.length === 0) {
            setLoadingCostDb(true);
            const { getCostItems } = await import('@/actions/estimating');
            const res = await getCostItems();
            if (res.success && res.data) {
                setCostItems(res.data);
            }
            setLoadingCostDb(false);
        }
    };

    const handleAddFromCostDb = (item: any) => {
        setNewLine({
            description: item.name,
            quantity: 1,
            unit: 'EA', // Default, maybe add unit to CostItem model later
            unitCost: item.unitCost || 0,
            markup: 0.15
        });
        setIsCostDbOpen(false);
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Top Bar */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/estimating" aria-label="Back to Estimating">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                    </Button>
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
                    <div className="flex gap-2">
                        {/* Inventory Dialog */}
                        <Dialog open={isInventoryOpen} onOpenChange={setIsInventoryOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={handleOpenInventory}>
                                    <Package className="w-4 h-4 mr-2" /> From Inventory
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Select Inventory Item</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <Input placeholder="Search inventory..." className="mb-4" />
                                    {loadingInventory ? (
                                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-2">
                                            {inventoryItems.map((item: any) => (
                                                <div key={item.id} className="flex justify-between items-center p-3 border rounded hover:bg-slate-50 cursor-pointer" onClick={() => handleAddFromInventory(item)}>
                                                    <div>
                                                        <div className="font-bold">{item.name}</div>
                                                        <div className="text-xs text-muted-foreground">SKU: {item.sku} • On Hand: {item.quantityOnHand} {item.unit}</div>
                                                    </div>
                                                    <div className="font-bold text-green-700">
                                                        ${item.costPerUnit?.toFixed(2)}/{item.unit}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>

                        {/* Cost DB Dialog */}
                        <Dialog open={isCostDbOpen} onOpenChange={setIsCostDbOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={handleOpenCostDb}>
                                    <ClipboardList className="w-4 h-4 mr-2" /> From Cost DB
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Select Cost Item</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <Input placeholder="Search cost items..." className="mb-4" />
                                    {loadingCostDb ? (
                                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-2">
                                            {costItems.map((item: any) => (
                                                <div key={item.id} className="flex justify-between items-center p-3 border rounded hover:bg-slate-50 cursor-pointer" onClick={() => handleAddFromCostDb(item)}>
                                                    <div>
                                                        <div className="font-bold">{item.code} - {item.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Labor: ${item.laborRate}/hr • Equip: ${item.equipmentRate}/hr
                                                        </div>
                                                    </div>
                                                    <div className="font-bold text-green-700">
                                                        ${item.unitCost?.toFixed(2)}/Unit
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Button variant="secondary" size="sm" onClick={() => handleAddAssembly('BORE_100')}>
                            <Plus className="w-4 h-4 mr-2" /> 100' Bore Kit
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => handleAddAssembly('POTHOLE')}>
                            <Plus className="w-4 h-4 mr-2" /> Pothole Kit
                        </Button>
                    </div>
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
                                            aria-label="Description"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={line.quantity}
                                            onChange={e => handleUpdateLine(line.id, 'quantity', Number(e.target.value))}
                                            className="w-20"
                                            aria-label="Quantity"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            value={line.unit}
                                            onChange={e => handleUpdateLine(line.id, 'unit', e.target.value)}
                                            className="w-16"
                                            aria-label="Unit"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={line.unitCost}
                                            onChange={e => handleUpdateLine(line.id, 'unitCost', Number(e.target.value))}
                                            className="w-24"
                                            aria-label="Unit Cost"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={line.markup * 100}
                                            onChange={e => handleUpdateLine(line.id, 'markup', Number(e.target.value) / 100)}
                                            className="w-16"
                                            aria-label="Markup Percentage"
                                        />
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        ${line.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteLine(line.id)} aria-label="Delete Line Item">
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {/* Add New Line Row */}
                            <TableRow className="bg-slate-50">
                                <TableCell>
                                    <Input placeholder="New Item Description" value={newLine.description} onChange={e => setNewLine({ ...newLine, description: e.target.value })} aria-label="New Item Description" />
                                </TableCell>
                                <TableCell>
                                    <Input type="number" value={newLine.quantity} onChange={e => setNewLine({ ...newLine, quantity: Number(e.target.value) })} aria-label="New Item Quantity" />
                                </TableCell>
                                <TableCell>
                                    <Input value={newLine.unit} onChange={e => setNewLine({ ...newLine, unit: e.target.value })} aria-label="New Item Unit" />
                                </TableCell>
                                <TableCell>
                                    <Input type="number" placeholder="Cost" value={newLine.unitCost} onChange={e => setNewLine({ ...newLine, unitCost: Number(e.target.value) })} aria-label="New Item Cost" />
                                </TableCell>
                                <TableCell>
                                    <Input type="number" value={newLine.markup * 100} onChange={e => setNewLine({ ...newLine, markup: Number(e.target.value) / 100 })} aria-label="New Item Markup" />
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
