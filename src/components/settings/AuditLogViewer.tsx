'use client';

import {
    getCoreRowModel,
    useReactTable,
    ColumnDef,
} from "@tanstack/react-table";
import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User as UserIcon, Shield, Activity } from "lucide-react";

interface AuditLog {
    id: string;
    action: string;
    entity: string;
    entityId: string;
    description: string | null;
    createdAt: Date;
    actor: {
        name: string | null;
        email: string;
        role: string;
    } | null;
}

interface AuditLogViewerProps {
    initialLogs: AuditLog[];
}

export function AuditLogViewer({ initialLogs }: AuditLogViewerProps) {
    const columns: ColumnDef<AuditLog>[] = [
        {
            accessorKey: "createdAt",
            header: "Time",
            cell: ({ row }) => (
                <div className="flex items-center text-sm">
                    <Clock className="w-3 h-3 mr-2 text-muted-foreground" />
                    {new Date(row.original.createdAt).toLocaleString()}
                </div>
            ),
        },
        {
            accessorKey: "actor.name",
            header: "Actor",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.original.actor?.name || 'System'}</span>
                    <span className="text-xs text-muted-foreground">{row.original.actor?.role || ''}</span>
                </div>
            ),
        },
        {
            accessorKey: "action",
            header: "Action",
            cell: ({ row }) => (
                <Badge variant="outline" className={
                    row.original.action === 'CREATE' ? 'border-green-500 text-green-700 bg-green-50 dark:bg-green-900/20' :
                        row.original.action === 'UPDATE' ? 'border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-900/20' :
                            row.original.action === 'DELETE' ? 'border-red-500 text-red-700 bg-red-50 dark:bg-red-900/20' :
                                'border-slate-400'
                }>{row.original.action}</Badge>
            ),
        },
        {
            accessorKey: "entity",
            header: "Entity",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{row.original.entity}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[100px]" title={row.original.entityId}>#{row.original.entityId.substring(0, 8)}</span>
                </div>
            )
        },
        {
            accessorKey: "description",
            header: "Details",
            cell: ({ row }) => (
                <p className="text-sm text-muted-foreground max-w-[200px] truncate" title={row.original.description || ''}>
                    {row.original.description || '-'}
                </p>
            ),
        }
    ];

    const table = useReactTable({
        data: initialLogs,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <ResponsiveDataTable
            table={table}
            columns={columns}
            renderMobileCard={(log) => (
                <Card className="mb-2">
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">{log.action}</Badge>
                            <span className="font-semibold text-sm">{log.entity}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <UserIcon className="w-4 h-4 text-muted-foreground" />
                            <span>{log.actor?.name || 'System'}</span>
                        </div>
                        {log.description && (
                            <p className="text-xs text-muted-foreground bg-slate-50 dark:bg-slate-900 p-2 rounded">
                                {log.description}
                            </p>
                        )}
                        <div className="text-xs text-muted-foreground font-mono">
                            ID: {log.entityId}
                        </div>
                    </CardContent>
                </Card>
            )}
        />
    );
}
