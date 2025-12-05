import { getReports } from "@/app/actions/reports";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, User, Calendar } from "lucide-react";
import ReportsTable from "./ReportsTable";

export default async function ReportsPage() {
    const reportsRes = await getReports();
    const reports = (reportsRes.success && reportsRes.data) ? reportsRes.data : [];

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8 border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-primary uppercase tracking-tight">Daily Reports</h1>
                    <p className="text-muted-foreground mt-1 font-sans">Review and manage field reports</p>
                </div>
                <Button asChild variant="secondary" size="lg" className="font-bold shadow-md">
                    <Link href="/dashboard/reports/new">
                        <span className="mr-2">+</span> New Report
                    </Link>
                </Button>
            </div>

            <ReportsTable reports={reports} />
        </div>
    );
}
