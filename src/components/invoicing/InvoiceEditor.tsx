'use client';

import { useState } from 'react';
import { updateInvoice, finalizeInvoice } from '@/actions/invoicing';
import { generateInvoicePDF } from '@/lib/pdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Save, Lock, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface InvoiceEditorProps {
    invoice: any;
}

export default function InvoiceEditor({ invoice }: InvoiceEditorProps) {
    const router = useRouter();
    const [items, setItems] = useState<any[]>(invoice.items);
    const [loading, setLoading] = useState(false);
    const [periodStart, setPeriodStart] = useState(invoice.periodStart ? new Date(invoice.periodStart).toISOString().split('T')[0] : '');
    const [periodEnd, setPeriodEnd] = useState(invoice.periodEnd ? new Date(invoice.periodEnd).toISOString().split('T')[0] : '');

    const isReadOnly = invoice.status !== 'DRAFT';

    const handleItemChange = (index: number, field: string, value: number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Recalculate derived fields for UI feedback
        const item = newItems[index];
        const completed = (item.previous || 0) + (item.thisPeriod || 0) + (item.stored || 0);
        item.totalCompleted = completed;
        item.percentComplete = item.scheduledValue > 0 ? (completed / item.scheduledValue) * 100 : 0;
        item.balance = item.scheduledValue - completed;
        item.retainage = completed * 0.10;

        setItems(newItems);
    };

    const handleSave = async () => {
        setLoading(true);
        const res = await updateInvoice(invoice.id, {
            items,
            periodStart: new Date(periodStart),
            periodEnd: new Date(periodEnd),
        });
        if (res.success) {
            router.refresh();
        } else {
            alert('Failed to save');
        }
        setLoading(false);
    };

    const handleFinalize = async () => {
        if (!confirm('Are you sure? This will lock the invoice.')) return;
        setLoading(true);
        const res = await finalizeInvoice(invoice.id);
        if (res.success) {
            router.refresh();
        } else {
            alert('Failed to finalize');
        }
        setLoading(false);
    };

    const formatCurrency = (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Calculate Totals
    const totalScheduled = items.reduce((acc, i) => acc + i.scheduledValue, 0);
    const totalCompleted = items.reduce((acc, i) => acc + i.totalCompleted, 0);
    const totalRetainage = items.reduce((acc, i) => acc + i.retainage, 0);

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
                <div>
                    <h2 className="text-xl font-bold">Application #{invoice.applicationNo}</h2>
                    <div className="flex gap-4 mt-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Period From:</span>
                            <Input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} disabled={isReadOnly} className="w-36 h-8" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">To:</span>
                            <Input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} disabled={isReadOnly} className="w-36 h-8" />
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {!isReadOnly && (
                        <>
                            <Button variant="outline" onClick={handleSave} disabled={loading}>
                                {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Save
                            </Button>
                            <Button onClick={handleFinalize} disabled={loading}>
                                <Lock className="w-4 h-4 mr-2" /> Finalize
                            </Button>
                        </>
                    )}
                    {isReadOnly && (
                        <Button variant="outline" onClick={() => generateInvoicePDF(invoice)}>
                            <Download className="w-4 h-4 mr-2" /> Export PDF
                        </Button>
                    )}
                </div>
            </div>

            {/* Schedule of Values Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[300px]">Description</TableHead>
                                <TableHead className="text-right">Scheduled Value</TableHead>
                                <TableHead className="text-right">Previous</TableHead>
                                <TableHead className="text-right bg-blue-50">This Period</TableHead>
                                <TableHead className="text-right bg-blue-50">Stored</TableHead>
                                <TableHead className="text-right">Total Completed</TableHead>
                                <TableHead className="text-right">%</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                                <TableHead className="text-right">Retainage</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item, idx) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.description}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.scheduledValue)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.previous)}</TableCell>
                                    <TableCell className="text-right bg-blue-50 p-1">
                                        <Input
                                            type="number"
                                            className="text-right h-8 bg-white"
                                            value={item.thisPeriod}
                                            onChange={e => handleItemChange(idx, 'thisPeriod', Number(e.target.value))}
                                            disabled={isReadOnly}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right bg-blue-50 p-1">
                                        <Input
                                            type="number"
                                            className="text-right h-8 bg-white"
                                            value={item.stored}
                                            onChange={e => handleItemChange(idx, 'stored', Number(e.target.value))}
                                            disabled={isReadOnly}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right font-bold">{formatCurrency(item.totalCompleted)}</TableCell>
                                    <TableCell className="text-right">{item.percentComplete.toFixed(1)}%</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.balance)}</TableCell>
                                    <TableCell className="text-right text-gray-500">{formatCurrency(item.retainage)}</TableCell>
                                </TableRow>
                            ))}
                            {/* Totals Row */}
                            <TableRow className="bg-gray-100 font-bold">
                                <TableCell>TOTALS</TableCell>
                                <TableCell className="text-right">{formatCurrency(totalScheduled)}</TableCell>
                                <TableCell className="text-right"></TableCell>
                                <TableCell className="text-right"></TableCell>
                                <TableCell className="text-right"></TableCell>
                                <TableCell className="text-right">{formatCurrency(totalCompleted)}</TableCell>
                                <TableCell className="text-right"></TableCell>
                                <TableCell className="text-right">{formatCurrency(totalScheduled - totalCompleted)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(totalRetainage)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
