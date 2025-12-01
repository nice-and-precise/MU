'use client';

import { useState, useEffect } from 'react';
import { getInventoryItems, createInventoryItem, updateInventoryItem, deleteInventoryItem, recordTransaction } from '@/actions/inventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, Package, Search, Pencil, Trash2, ArrowRightLeft, AlertTriangle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function InventoryPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Dialog States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isAdjustOpen, setIsAdjustOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Form States
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        category: 'Fluid',
        unit: 'Bag',
        quantityOnHand: 0,
        sku: '',
        location: '',
        reorderPoint: 10
    });
    const [adjustData, setAdjustData] = useState({
        type: 'IN',
        quantity: 0,
        notes: ''
    });

    useEffect(() => {
        loadInventory();
    }, []);

    async function loadInventory() {
        setLoading(true);
        const res = await getInventoryItems();
        if (res.success) {
            setItems(res.data || []);
        }
        setLoading(false);
    }

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handlers
    const handleCreate = async () => {
        const res = await createInventoryItem(formData);
        if (res.success) {
            setIsAddOpen(false);
            loadInventory();
            resetForm();
        }
    };

    const handleUpdate = async () => {
        if (!selectedItem) return;
        const res = await updateInventoryItem(selectedItem.id, formData);
        if (res.success) {
            setIsEditOpen(false);
            loadInventory();
            setSelectedItem(null);
        }
    };

    const handleDelete = async () => {
        if (!selectedItem) return;
        const res = await deleteInventoryItem(selectedItem.id);
        if (res.success) {
            setIsDeleteOpen(false);
            loadInventory();
            setSelectedItem(null);
        }
    };

    const handleAdjust = async () => {
        if (!selectedItem) return;
        const res = await recordTransaction({
            itemId: selectedItem.id,
            type: adjustData.type as 'IN' | 'OUT' | 'ADJUST',
            quantity: Number(adjustData.quantity),
            performedById: 'user_id_placeholder', // TODO: Get real user ID
            notes: adjustData.notes
        });
        if (res.success) {
            setIsAdjustOpen(false);
            loadInventory();
            setSelectedItem(null);
            setAdjustData({ type: 'IN', quantity: 0, notes: '' });
        }
    };

    const openEdit = (item: any) => {
        setSelectedItem(item);
        setFormData({
            name: item.name,
            category: item.category,
            unit: item.unit,
            quantityOnHand: item.quantityOnHand,
            sku: item.sku || '',
            location: item.location || '',
            reorderPoint: item.reorderPoint || 10
        });
        setIsEditOpen(true);
    };

    const openAdjust = (item: any) => {
        setSelectedItem(item);
        setAdjustData({ type: 'IN', quantity: 0, notes: '' });
        setIsAdjustOpen(true);
    };

    const openDelete = (item: any) => {
        setSelectedItem(item);
        setIsDeleteOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: 'Fluid',
            unit: 'Bag',
            quantityOnHand: 0,
            sku: '',
            location: '',
            reorderPoint: 10
        });
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
                    <p className="text-muted-foreground">Track fluids, pipe, tooling, and assets.</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search items..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => { resetForm(); setIsAddOpen(true); }}>
                        <Plus className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{items.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {items.filter(i => i.quantityOnHand <= (i.reorderPoint || 10)).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Inventory Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Inventory List</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                                    </TableRow>
                                ) : filteredItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">No items found.</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredItems.map((item) => {
                                        const isLowStock = item.quantityOnHand <= (item.reorderPoint || 10);
                                        return (
                                            <TableRow key={item.id} className={isLowStock ? "bg-orange-50/50" : ""}>
                                                <TableCell className="font-medium">
                                                    {item.name}
                                                    {isLowStock && <span className="ml-2 text-xs text-orange-600 font-bold flex items-center inline-flex"><AlertTriangle className="w-3 h-3 mr-1" /> Low</span>}
                                                </TableCell>
                                                <TableCell>{item.category}</TableCell>
                                                <TableCell>{item.sku || '-'}</TableCell>
                                                <TableCell>{item.location || '-'}</TableCell>
                                                <TableCell className="text-right font-mono font-bold">{item.quantityOnHand}</TableCell>
                                                <TableCell>{item.unit}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button variant="ghost" size="icon" onClick={() => openAdjust(item)} title="Adjust Stock">
                                                            <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)} title="Edit">
                                                            <Pencil className="w-4 h-4 text-slate-600" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => openDelete(item)} title="Delete">
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={isAddOpen || isEditOpen} onOpenChange={open => { if (!open) { setIsAddOpen(false); setIsEditOpen(false); } }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditOpen ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Name</Label>
                            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Category</Label>
                            <Select value={formData.category} onValueChange={val => setFormData({ ...formData, category: val })}>
                                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Fluid">Drilling Fluid</SelectItem>
                                    <SelectItem value="Pipe">Pipe / Conduit</SelectItem>
                                    <SelectItem value="Tooling">Downhole Tooling</SelectItem>
                                    <SelectItem value="Parts">Spare Parts</SelectItem>
                                    <SelectItem value="PPE">Safety / PPE</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Unit</Label>
                            <Input value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Qty</Label>
                            <Input type="number" value={formData.quantityOnHand} onChange={e => setFormData({ ...formData, quantityOnHand: Number(e.target.value) })} className="col-span-3" disabled={isEditOpen} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Reorder Pt</Label>
                            <Input type="number" value={formData.reorderPoint} onChange={e => setFormData({ ...formData, reorderPoint: Number(e.target.value) })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">SKU</Label>
                            <Input value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Location</Label>
                            <Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={isEditOpen ? handleUpdate : handleCreate}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Adjust Stock Dialog */}
            <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adjust Stock: {selectedItem?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Action</Label>
                            <Select value={adjustData.type} onValueChange={val => setAdjustData({ ...adjustData, type: val })}>
                                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="IN">Restock (Add)</SelectItem>
                                    <SelectItem value="OUT">Use (Subtract)</SelectItem>
                                    <SelectItem value="ADJUST">Count (Set Total)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Quantity</Label>
                            <Input type="number" value={adjustData.quantity} onChange={e => setAdjustData({ ...adjustData, quantity: Number(e.target.value) })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Notes</Label>
                            <Textarea value={adjustData.notes} onChange={e => setAdjustData({ ...adjustData, notes: e.target.value })} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAdjust}>Confirm Adjustment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Item</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to delete <strong>{selectedItem?.name}</strong>? This action cannot be undone.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
