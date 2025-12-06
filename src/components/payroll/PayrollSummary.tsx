import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PayrollEntry {
    employeeId: string;
    employeeName: string;
    regularHours: number;
    overtimeHours: number;
    doubleTimeHours: number;
    totalHours: number;
}

interface PayrollSummaryProps {
    data: PayrollEntry[];
}

export function PayrollSummary({ data }: PayrollSummaryProps) {
    const handleDownloadCSV = () => {
        // Simple CSV generation
        const headers = ["Employee Name", "Regular Hours", "Overtime Hours", "Double Time Hours", "Total Hours"];
        const rows = data.map(entry => [
            entry.employeeName,
            entry.regularHours.toString(),
            entry.overtimeHours.toString(),
            entry.doubleTimeHours.toString(),
            entry.totalHours.toString()
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "payroll_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (data.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500">
                No data to display. Generate a report to see payroll details.
            </div>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Payroll Summary</CardTitle>
                <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </CardHeader>
            <CardContent>
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Employee</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Regular Hrs</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Overtime Hrs</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Total Hrs</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {data.map((entry) => (
                                <tr key={entry.employeeId} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <td className="p-4 align-middle font-medium">{entry.employeeName}</td>
                                    <td className="p-4 align-middle text-right">{entry.regularHours}</td>
                                    <td className="p-4 align-middle text-right font-semibold text-amber-600">{entry.overtimeHours > 0 ? entry.overtimeHours : '-'}</td>
                                    <td className="p-4 align-middle text-right font-bold">{entry.totalHours}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="border-t bg-muted/50 font-medium [&>tr]:last:border-b-0">
                            <tr>
                                <td className="p-4 align-middle">Total</td>
                                <td className="p-4 align-middle text-right">{data.reduce((acc, curr) => acc + curr.regularHours, 0).toFixed(2)}</td>
                                <td className="p-4 align-middle text-right">{data.reduce((acc, curr) => acc + curr.overtimeHours, 0).toFixed(2)}</td>
                                <td className="p-4 align-middle text-right">{data.reduce((acc, curr) => acc + curr.totalHours, 0).toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
