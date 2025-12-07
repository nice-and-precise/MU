"use client";

import React from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, User, Calendar } from "lucide-react";

interface Report {
    id: string;
    reportDate: Date;
    project: { name: string };
    createdBy: { name: string | null };
    status: string;
    notes: string | null;
}

interface ReportsTableProps {
    reports: Report[];
}

import { EmptyState } from "@/components/ui/empty-state";

import {
    getCoreRowModel,
    useReactTable,
    ColumnDef,
} from "@tanstack/react-table";
import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export default function ReportsTable({ reports }: ReportsTableProps) {
    // Columns definition
    const columns: ColumnDef<Report>[] = [
        {
            accessorKey: "reportDate",
            header: "Date",
            cell: ({ row }) => (
                <div className="flex items-center font-bold">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    {new Date(row.original.reportDate).toLocaleDateString()}
                </div>
            ),
        },
        {
            accessorKey: "project.name",
            header: "Project",
        },
        {
            accessorKey: "createdBy.name",
            header: "Submitted By",
            cell: ({ row }) => (
                <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    {row.original.createdBy.name ?? 'Unknown'}
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
        {
            id: "actions",
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="text-right">
                    <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/reports/${row.original.id}`}>
                            View
                        </Link>
                    </Button>
                </div>
            ),
        },
    ];

    const table = useReactTable({
        data: reports,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (reports.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-border p-8">
                <EmptyState
                    title="No Reports"
                    description="No reports today. Create one for each active crew."
                    icon={FileText}
                />
            </div>
        );
    }

    return (
        <ResponsiveDataTable
            table={table}
            columns={columns}
            renderMobileCard={(report) => (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {new Date(report.reportDate).toLocaleDateString()}
                        </CardTitle>
                        <StatusBadge status={report.status} />
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-1">
                            <p className="font-bold truncate">{report.project.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center">
                                <User className="mr-1 h-3 w-3" /> {report.createdBy.name}
                            </p>
                            <Button asChild variant="secondary" size="sm" className="mt-2 w-full">
                                <Link href={`/dashboard/reports/${report.id}`}>
                                    View Report
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        />
    );
}
