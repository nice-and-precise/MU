"use client";

import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
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

export default function ReportsTable({ reports }: ReportsTableProps) {
    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: reports.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 73, // Approximate row height
        overscan: 5,
    });

    return (
        <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden flex flex-col h-[600px]">
            <div className="overflow-x-auto flex-1 flex flex-col">
                <div className="bg-muted text-muted-foreground font-bold font-heading uppercase tracking-wider border-b border-border flex min-w-[800px]">
                    <div className="px-6 py-4 w-1/5">Date</div>
                    <div className="px-6 py-4 w-1/4">Project</div>
                    <div className="px-6 py-4 w-1/4">Submitted By</div>
                    <div className="px-6 py-4 w-1/6">Status</div>
                    <div className="px-6 py-4 w-1/6 text-right">Actions</div>
                </div>

                <div
                    ref={parentRef}
                    className="flex-1 overflow-y-auto w-full"
                    style={{ contain: 'strict' }}
                >
                    <div
                        style={{
                            height: `${rowVirtualizer.getTotalSize()}px`,
                            width: '100%',
                            position: 'relative',
                            minWidth: '800px'
                        }}
                    >
                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                            const report = reports[virtualRow.index];
                            return (
                                <div
                                    key={report.id}
                                    className="absolute top-0 left-0 w-full flex hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-border"
                                    style={{
                                        height: `${virtualRow.size}px`,
                                        transform: `translateY(${virtualRow.start}px)`,
                                    }}
                                >
                                    <div className="px-6 py-4 w-1/5 text-gray-900 dark:text-white font-bold flex items-center font-sans">
                                        <Calendar className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                                        {new Date(report.reportDate).toLocaleDateString()}
                                    </div>
                                    <div className="px-6 py-4 w-1/4 text-gray-700 dark:text-gray-300 truncate font-sans">
                                        {report.project.name}
                                    </div>
                                    <div className="px-6 py-4 w-1/4 text-gray-700 dark:text-gray-300 flex items-center font-sans">
                                        <User className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                                        <span className="truncate">{report.createdBy.name}</span>
                                    </div>
                                    <div className="px-6 py-4 w-1/6">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${report.status === "APPROVED"
                                                ? "bg-green-100 text-green-800"
                                                : report.status === "SUBMITTED"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                                }`}
                                        >
                                            {report.status}
                                        </span>
                                    </div>
                                    <div className="px-6 py-4 w-1/6 text-right">
                                        <Button asChild variant="link" className="font-bold">
                                            <Link href={`/dashboard/reports/${report.id}`}>
                                                View
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div >
            </div >
        </div >
    );
}
