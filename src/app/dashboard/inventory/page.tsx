'use client';

import { useState, useEffect } from 'react';
import { getInventoryItems, createInventoryItem } from '@/actions/inventory';
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
import { Plus, Package, Search } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function InventoryPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        category: 'Fluid',
        unit: 'Bag',
        quantityOnHand: 0,
        sku: '',
        location: '',
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

    async function handleCreate() {
        const res = await createInventoryItem(newItem);
        if (res.success) {
            setIsAddOpen(false);
            loadInventory();
            setNewItem({
                name: '',
                category: 'Fluid',
                unit: 'Bag',
                quantityOnHand: 0,
                sku: '',
                location: '',
            });
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
                    <p className="text-muted-foreground">Track fluids, pipe, tooling, and assets.</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Item
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Inventory Item</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="category" className="text-right">
                                    Category
                                </Label>
                                <Select
                                    value={newItem.category}
                                    onValueChange={(val) => setNewItem({ ...newItem, category: val })}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
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
                                <Label htmlFor="unit" className="text-right">
                                    Unit
                                </Label>
                                <Input
                                    id="unit"
                                    value={newItem.unit}
                                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                                    className="col-span-3"
                                    placeholder="e.g. Bag, Pallet, Foot"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="qty" className="text-right">
                                    Initial Qty
                                </Label>
                                <Input
                                    id="qty"
                                    type="number"
                                    value={newItem.quantityOnHand}
                                    onChange={(e) =>
                                        setNewItem({ ...newItem, quantityOnHand: parseFloat(e.target.value) })
                                    }
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <Button onClick={handleCreate}>Save Item</Button>
                    </DialogContent>
                </Dialog>
            </div>

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
                {/* Add more summary cards here later */}
            </div>

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
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">
                                            No items found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>{item.category}</TableCell>
                                            <TableCell>{item.sku || '-'}</TableCell>
                                            <TableCell>{item.location || '-'}</TableCell>
                                            <TableCell className="text-right">{item.quantityOnHand}</TableCell>
                                            <TableCell>{item.unit}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
