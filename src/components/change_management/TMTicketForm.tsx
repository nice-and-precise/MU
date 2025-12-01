'use client';

import { useState } from 'react';
import { createTMTicket } from '@/actions/change_management';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TMTicketFormProps {
    projectId: string;
}

export default function TMTicketForm({ projectId }: TMTicketFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [lineItems, setLineItems] = useState<any[]>([]);
    const [newItem, setNewItem] = useState({ type: 'LABOR', description: '', quantity: 1, unit: 'HR' });

    const handleAddItem = () => {
        if (!newItem.description) return;
        setLineItems([...lineItems, newItem]);
        setNewItem({ type: 'LABOR', description: '', quantity: 1, unit: 'HR' });
    };

    const handleRemoveItem = (index: number) => {
        setLineItems(lineItems.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (lineItems.length === 0) return;
        setLoading(true);
        const res = await createTMTicket({
            projectId,
            lineItems,
        });
        if (res.success) {
            setLineItems([]);
            router.refresh();
        } else {
            alert('Failed to create ticket');
        }
        setLoading(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>New T&M Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Add Item Form */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
                    <div className="md:col-span-1">
                        <Label>Type</Label>
                        <Select value={newItem.type} onValueChange={val => setNewItem({ ...newItem, type: val })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="LABOR">Labor</SelectItem>
                                <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                                <SelectItem value="MATERIAL">Material</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="md:col-span-2">
                        <Label>Description</Label>
                        <Input value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} placeholder="e.g. Extra excavation" />
                    </div>
                    <div className="md:col-span-1">
                        <Label>Qty</Label>
                        <div className="flex gap-2">
                            <Input type="number" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: Number(e.target.value) })} />
                            <Input value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit: e.target.value })} className="w-16" />
                        </div>
                    </div>
                    <div className="md:col-span-1">
                        <Button onClick={handleAddItem} className="w-full"><Plus className="w-4 h-4" /></Button>
                    </div>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                    {lineItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded border">
                            <span className="text-sm font-medium w-20">{item.type}</span>
                            <span className="flex-1 mx-2">{item.description}</span>
                            <span className="text-sm text-muted-foreground mr-4">{item.quantity} {item.unit}</span>
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(idx)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>
                    ))}
                    {lineItems.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No items added.</p>}
                </div>

                <Button onClick={handleSubmit} disabled={loading || lineItems.length === 0} className="w-full">
                    {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Submit Ticket
                </Button>
            </CardContent>
        </Card>
    );
}
