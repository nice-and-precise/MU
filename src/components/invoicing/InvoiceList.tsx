'use client';

import { useEffect, useState } from 'react';
import { getInvoices, createInvoice } from '@/actions/invoicing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveDataTable } from '@/components/ui/responsive-data-table';
import { useReactTable, getCoreRowModel, ColumnDef } from '@tanstack/react-table';
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

    // Define columns
    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "applicationNo",
            header: "App #",
            cell: ({ row }) => `#${row.original.applicationNo}`,
        },
        {
            accessorKey: "periodEnd",
            header: "Period Ending",
            cell: ({ row }) => new Date(row.original.periodEnd).toLocaleDateString(),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <span className={`px-2 py-1 rounded text-xs font-medium ${row.original.status === 'PAID' ? 'bg-green-100 text-green-800' :
                    row.original.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                    }`}>
                    {row.original.status}
                </span>
            ),
        },
        {
            accessorKey: "totalCompleted",
            header: () => <div className="text-right">Total Completed</div>,
            cell: ({ row }) => <div className="text-right">${row.original.totalCompleted.toLocaleString()}</div>,
        },
        {
            accessorKey: "currentDue",
            header: () => <div className="text-right">Current Due</div>,
            cell: ({ row }) => <div className="text-right font-bold">${row.original.currentDue.toLocaleString()}</div>,
        },
        {
            id: "actions",
            header: () => null,
            cell: ({ row }) => (
                <div className="text-right">
                    <Link href={`/dashboard/invoices/${row.original.id}`}>
                        <Button variant="ghost" size="sm">
                            View <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            ),
        }
    ];

    const table = useReactTable({
        data: invoices,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

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
                <ResponsiveDataTable
                    table={table}
                    columns={columns}
                    renderMobileCard={(inv) => (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-lg text-gray-900 dark:text-gray-100">App #{inv.applicationNo}</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${inv.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                    inv.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                                    }`}>
                                    {inv.status}
                                </span>
                            </div>
                            <div className="text-sm text-gray-500">
                                Period Ending: {new Date(inv.periodEnd).toLocaleDateString()}
                            </div>
                            <div className="flex justify-between items-center py-2 border-y border-gray-100 dark:border-gray-700">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Completed</p>
                                    <p className="font-medium">${inv.totalCompleted.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase">Current Due</p>
                                    <p className="font-bold text-green-600">${inv.currentDue.toLocaleString()}</p>
                                </div>
                            </div>
                            <Link href={`/dashboard/invoices/${inv.id}`} className="block">
                                <Button className="w-full" variant="outline">
                                    View Details <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    )}
                />
            </CardContent>
        </Card>
    );
}
