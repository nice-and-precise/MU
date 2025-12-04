'use client';

import { useState } from 'react';
import { createExpense } from '@/actions/expenses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

const expenseSchema = z.object({
    date: z.string().min(1, "Date is required"),
    category: z.string().min(1, "Category is required"),
    description: z.string().min(1, "Description is required"),
    amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
    vendor: z.string().optional(),
});

type ExpenseValues = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
    projectId: string;
    onSuccess: () => void;
}

export default function ExpenseForm({ projectId, onSuccess }: ExpenseFormProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const form = useForm<ExpenseValues>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            category: '',
            description: '',
            amount: 0,
            vendor: '',
        },
    });

    const onSubmit = async (data: ExpenseValues) => {
        setLoading(true);
        try {
            const res = await createExpense({
                projectId,
                date: new Date(data.date),
                category: data.category,
                description: data.description,
                amount: data.amount,
                vendor: data.vendor || undefined,
            });

            if (res.success) {
                setOpen(false);
                form.reset({
                    date: new Date().toISOString().split('T')[0],
                    category: '',
                    description: '',
                    amount: 0,
                    vendor: '',
                });
                toast.success("Expense logged successfully");
                onSuccess();
            } else {
                toast.error(res.error || 'Failed to create expense');
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
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
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                        </FormControl>
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="What was purchased?" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="vendor"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vendor (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Store or Company Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                                Save Expense
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
