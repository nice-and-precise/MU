"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { flexRender, ColumnDef, Table as ReactTable } from "@tanstack/react-table";

interface ResponsiveDataTableProps<TData> {
    table: ReactTable<TData>;
    columns: ColumnDef<TData, any>[];
    renderMobileCard: (item: TData) => React.ReactNode;
}

export function ResponsiveDataTable<TData>({
    table,
    columns,
    renderMobileCard,
}: ResponsiveDataTableProps<TData>) {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (!isDesktop) {
        return (
            <div className="grid gap-4 sm:grid-cols-2">
                {table.getRowModel().rows.map((row) => (
                    <div key={row.id}>
                        {renderMobileCard(row.original)}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
