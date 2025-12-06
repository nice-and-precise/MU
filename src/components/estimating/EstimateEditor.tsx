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
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { getInventoryItems } from '@/actions/inventory';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EstimateEditorProps {
    estimate: any;
}

const headerSchema = z.object({
    name: z.string().min(1, "Estimate name is required"),
    customerName: z.string().min(1, "Customer name is required"),
    status: z.enum(["DRAFT", "SENT", "WON", "LOST"]),
});

const lineItemSchema = z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.coerce.number().min(0, "Quantity must be positive"),
    unit: z.string().min(1, "Unit is required"),
    unitCost: z.coerce.number().min(0, "Cost must be positive"),
    markup: z.coerce.number().min(0, "Markup must be positive"),
});

export default function EstimateEditor({ estimate }: EstimateEditorProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const headerForm = useForm<z.infer<typeof headerSchema>>({
        resolver: zodResolver(headerSchema) as any,
        defaultValues: {
            name: estimate.name,
            customerName: estimate.customerName || '',
            status: estimate.status,
        }
    });

    const lineForm = useForm<z.infer<typeof lineItemSchema>>({
        resolver: zodResolver(lineItemSchema) as any,
        defaultValues: {
            description: '',
            quantity: 1,
            unit: 'LS',
            unitCost: 0,
            markup: 0.15
        }
    });

    // Header Updates
    const onHeaderSubmit = async (data: z.infer<typeof headerSchema>) => {
        setLoading(true);
        await updateEstimate(estimate.id, data);
        setLoading(false);
        toast.success("Header saved");
        router.refresh();
    };

    // Line Item Management
    const onAddLineSubmit = async (data: z.infer<typeof lineItemSchema>) => {
        setLoading(true);
        await addLineItem({
            estimateId: estimate.id,
            data: {
                ...data,
                laborCost: 0,
                equipmentCost: 0,
                materialCost: 0
            }
        });
        lineForm.reset();
        setLoading(false);
        toast.success("Line item added");
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
        lineForm.reset({
            description: item.name,
            quantity: 1,
            unit: item.unit,
            unitCost: item.costPerUnit || 0,
            markup: 0.15
        });
        setIsInventoryOpen(false);
    };

    const KITS: Record<string, { name: string, description: string, icon: any, items: any[] }> = {
        'BORE_100': {
            name: "100' Bore Kit",
            description: "Standard 2\" HDPE",
            icon: ArrowLeft, // specific icon not crucial, using generic
            items: [
                { description: 'Directional Bore - 2" HDPE', quantity: 100, unit: 'LF', unitCost: 12.00, markup: 0.20 },
                { description: 'Bore Crew (Foreman, Op, Labor)', quantity: 4, unit: 'HR', unitCost: 225.00, markup: 0.15 },
                { description: 'Drill Rig (D24x40)', quantity: 4, unit: 'HR', unitCost: 150.00, markup: 0.15 },
            ]
        },
        'BORE_500': {
            name: "500' Bore Kit",
            description: "Long haul 4\" HDPE",
            icon: ArrowLeft,
            items: [
                { description: 'Directional Bore - 4" HDPE', quantity: 500, unit: 'LF', unitCost: 18.00, markup: 0.25 },
                { description: 'Bore Crew (Foreman, Op, Labor)', quantity: 20, unit: 'HR', unitCost: 225.00, markup: 0.15 },
                { description: 'Drill Rig (D40x55)', quantity: 20, unit: 'HR', unitCost: 220.00, markup: 0.15 },
                { description: 'Vac Truck Support', quantity: 20, unit: 'HR', unitCost: 110.00, markup: 0.15 },
            ]
        },
        'POTHOLE': {
            name: "Pothole Kit",
            description: "Vac excavation",
            icon: ArrowLeft,
            items: [
                { description: 'Vacuum Pothole (0-6ft)', quantity: 1, unit: 'EA', unitCost: 350.00, markup: 0.20 },
                { description: 'Vac Truck', quantity: 2, unit: 'HR', unitCost: 110.00, markup: 0.15 },
                { description: 'Laborer', quantity: 2, unit: 'HR', unitCost: 45.00, markup: 0.15 },
            ]
        },
        'SERVICE_LAT': {
            name: "Service Lateral",
            description: "1\" Service Drop (50')",
            icon: ArrowLeft,
            items: [
                { description: 'Service Drop - 1" HDPE', quantity: 50, unit: 'LF', unitCost: 8.00, markup: 0.20 },
                { description: 'Service Crew', quantity: 4, unit: 'HR', unitCost: 180.00, markup: 0.15 },
                { description: 'Vac Truck Support', quantity: 2, unit: 'HR', unitCost: 110.00, markup: 0.15 },
            ]
        }
    };

    const handleAddAssembly = async (key: string) => {
        setLoading(true);
        const kit = KITS[key];
        if (kit) {
            for (const item of kit.items) {
                await addLineItem({
                    estimateId: estimate.id,
                    data: {
                        ...item,
                        laborCost: 0,
                        equipmentCost: 0,
                        materialCost: 0
                    }
                });
            }
            toast.success(`added ${kit.name}`);
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
        lineForm.reset({
            description: item.name,
            quantity: 1,
            unit: 'EA', // Default, maybe add unit to CostItem model later
            unitCost: item.unitCost || 0,
            markup: 0.15
        });
        setIsCostDbOpen(false);
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* Top Bar */}
            <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/estimating" aria-label="Back to Estimating">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{estimate.name}</h1>
                        <Badge variant="outline" className="mt-1 font-normal">#{estimate.id?.slice(-6)}</Badge>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center md:hidden lg:flex">
                            <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded-full mr-2">Office Impact</span>
                            Converting this estimate will create a project with all selected bores and budget.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => generateEstimatePDF(estimate)}>
                        <Download className="w-4 h-4 mr-2" /> Export PDF
                    </Button>
                    <Button onClick={headerForm.handleSubmit(onHeaderSubmit)} disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

                {/* LEFT SIDEBAR: Kit Library */}
                <div className="md:col-span-3 space-y-4">
                    <Card className="border-none shadow-md bg-card/50">
                        <CardHeader className="bg-muted/50 pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary" /> Kit Library
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 grid gap-3">
                            {Object.entries(KITS).map(([key, kit]) => (
                                <button
                                    key={key}
                                    onClick={() => handleAddAssembly(key)}
                                    disabled={loading}
                                    className="flex w-full flex-col items-start gap-1 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent"
                                >
                                    <div className="flex w-full items-center justify-between">
                                        <span className="font-semibold">{kit.name}</span>
                                        <Plus className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {kit.description}
                                    </span>
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md bg-card/50">
                        <CardHeader className="bg-muted/50 pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ClipboardList className="w-5 h-5 text-primary" /> Tools
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2">
                            <Dialog open={isInventoryOpen} onOpenChange={setIsInventoryOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start" onClick={handleOpenInventory}>
                                        <Package className="w-4 h-4 mr-2" /> Inventory Item
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
                                                            <div className="text-sm text-muted-foreground">SKU: {item.sku} • On Hand: {item.quantityOnHand} {item.unit}</div>
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

                            <Dialog open={isCostDbOpen} onOpenChange={setIsCostDbOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start" onClick={handleOpenCostDb}>
                                        <ClipboardList className="w-4 h-4 mr-2" /> Cost Database
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
                                                            <div className="text-sm text-muted-foreground">
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
                        </CardContent>
                    </Card>
                </div>

                {/* MAIN CONTENT */}
                <div className="md:col-span-9 space-y-6">
                    {/* Header Info */}
                    <Card>
                        <CardContent className="p-6">
                            <Form {...headerForm}>
                                <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={headerForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel required>Estimate Name</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={headerForm.control}
                                        name="customerName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel required>Customer</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={headerForm.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel required>Status</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="DRAFT">Draft</SelectItem>
                                                        <SelectItem value="SENT">Sent</SelectItem>
                                                        <SelectItem value="WON">Won</SelectItem>
                                                        <SelectItem value="LOST">Lost</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    {/* Line Items */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
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
                                        <TableHead className="w-[10%] text-right">Actuals</TableHead>
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
                                            <TableCell className="text-right text-muted-foreground">
                                                {/* Mock Actuals for Demo */}
                                                ${(line.total * (0.9 + Math.random() * 0.2)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteLine(line.id)} aria-label="Delete Line Item">
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {/* Add New Line Row */}
                                    <Form {...lineForm}>
                                        <TableRow className="bg-slate-50">
                                            <TableCell>
                                                <FormField
                                                    control={lineForm.control}
                                                    name="description"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input placeholder="New Item Description" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={lineForm.control}
                                                    name="quantity"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input type="number" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={lineForm.control}
                                                    name="unit"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={lineForm.control}
                                                    name="unitCost"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input type="number" placeholder="Cost" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={lineForm.control}
                                                    name="markup"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value) / 100)} value={(field.value || 0) * 100} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" onClick={lineForm.handleSubmit(onAddLineSubmit)} disabled={loading}>
                                                    <Plus className="w-4 h-4 mr-2" /> Add
                                                </Button>
                                            </TableCell>
                                            <TableCell></TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    </Form>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Totals */}
                    <div className="flex justify-end">
                        <Card className="w-1/2 md:w-1/3">
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
            </div>
        </div>
    );
}
