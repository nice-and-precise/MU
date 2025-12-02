'use client';

import { useState } from 'react';
import { createExpense } from '@/actions/expenses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ExpenseFormProps {
    projectId: string;
    onSuccess: () => void;
}

export default function ExpenseForm({ projectId, onSuccess }: ExpenseFormProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        category: '',
        description: '',
        amount: '',
        vendor: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await createExpense({
            projectId,
            date: new Date(formData.date),
            category: formData.category,
            description: formData.description,
            amount: parseFloat(formData.amount),
            vendor: formData.vendor || undefined,
        });

        if (res.success) {
            setOpen(false);
            setFormData({
                date: new Date().toISOString().split('T')[0],
                category: '',
                description: '',
                amount: '',
                vendor: '',
            });
            onSuccess();
        } else {
            alert(res.error || 'Failed to create expense');
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" /> Log Expense
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Log Project Expense</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                                type="date"
                                required
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Amount</Label>
                            <Input
                                type="number"
                                step="0.01"
                                required
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                            value={formData.category}
                            onValueChange={val => setFormData({ ...formData, category: val })}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Material">Material</SelectItem>
                                <SelectItem value="Fuel">Fuel</SelectItem>
                                <SelectItem value="Equipment Rental">Equipment Rental</SelectItem>
                                <SelectItem value="Subcontractor">Subcontractor</SelectItem>
                                <SelectItem value="Per Diem">Per Diem</SelectItem>
                                <SelectItem value="Travel">Travel</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                            required
                            placeholder="What was purchased?"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Vendor (Optional)</Label>
                        <Input
                            placeholder="Store or Company Name"
                            value={formData.vendor}
                            onChange={e => setFormData({ ...formData, vendor: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                            Save Expense
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
