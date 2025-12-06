'use client';

import { useState } from "react";
import { PayrollExportForm } from "@/components/payroll/PayrollExportForm";
import { PayrollSummary } from "@/components/payroll/PayrollSummary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PayrollPage() {
    const [reportData, setReportData] = useState<any[]>([]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Payroll Export</h1>

            <section className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Generate Report</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PayrollExportForm onReportGenerated={setReportData} />
                    </CardContent>
                </Card>

                {reportData.length > 0 && (
                    <PayrollSummary data={reportData} />
                )}
            </section>
        </div>
    );
}
