'use client';

import { useEffect, useState } from 'react';
import { getExpenses, deleteExpense } from '@/actions/expenses';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface ExpenseListProps {
    projectId: string;
    refreshTrigger: number;
}

export default function ExpenseList({ projectId, refreshTrigger }: ExpenseListProps) {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const res = await getExpenses(projectId);
            if (res.success) {
                setExpenses(res.data || []);
            }
            setLoading(false);
        }
        load();
    }, [projectId, refreshTrigger]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;
        const res = await deleteExpense({ id, projectId });
        if (res.success) {
            setExpenses(expenses.filter(e => e.id !== id));
        } else {
            alert('Failed to delete expense');
        }
    };

    if (loading) return <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {expenses.map((expense) => (
                        <TableRow key={expense.id}>
                            <TableCell>{format(new Date(expense.date), 'MMM d, yyyy')}</TableCell>
                            <TableCell>{expense.category}</TableCell>
                            <TableCell>{expense.description}</TableCell>
                            <TableCell>{expense.vendor || '-'}</TableCell>
                            <TableCell className="text-right font-medium">${expense.amount.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(expense.id)}>
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {expenses.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                No expenses recorded.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
