'use client';

import { useEffect, useState } from 'react';
import { getInvoices, createInvoice } from '@/actions/invoicing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, FileText, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface InvoiceListProps {
    projectId: string;
}

export default function InvoiceList({ projectId }: InvoiceListProps) {
    const router = useRouter();
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        async function load() {
            const res = await getInvoices(projectId);
            if (res?.data) {
                setInvoices(res.data);
            }
            setLoading(false);
        }
        load();
    }, [projectId]);

    const handleCreate = async () => {
        setCreating(true);
        const res = await createInvoice({ projectId });
        if (res?.data) {
            router.push(`/dashboard/invoices/${res.data.id}`);
        } else {
            alert(res?.error || 'Failed to create invoice');
            setCreating(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Applications for Payment</CardTitle>
                <Button onClick={handleCreate} disabled={creating}>
                    {creating ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    New Application
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>App #</TableHead>
                            <TableHead>Period Ending</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total Completed</TableHead>
                            <TableHead className="text-right">Current Due</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.map((inv) => (
                            <TableRow key={inv.id}>
                                <TableCell>#{inv.applicationNo}</TableCell>
                                <TableCell>{new Date(inv.periodEnd).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${inv.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                        inv.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                                        }`}>
                                        {inv.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">${inv.totalCompleted.toLocaleString()}</TableCell>
                                <TableCell className="text-right font-bold">${inv.currentDue.toLocaleString()}</TableCell>
                                <TableCell className="text-right">
                                    <Link href={`/dashboard/invoices/${inv.id}`}>
                                        <Button variant="ghost" size="sm">
                                            View <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                        {invoices.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No invoices created yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
