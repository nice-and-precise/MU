import { getReports } from "@/app/actions/reports";
import Link from "next/link";
import { FileText, User, Calendar } from "lucide-react";
import ReportsTable from "./ReportsTable";

export default async function ReportsPage() {
    const reports = await getReports();

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-[#003366] uppercase tracking-tight">Daily Reports</h1>
                    <p className="text-gray-500 mt-1">Review and manage field reports</p>
                </div>
                <Link
                    href="/dashboard/reports/new"
                    className="bg-[#003366] hover:bg-[#002244] text-white px-6 py-3 rounded font-bold shadow-sm transition-colors flex items-center"
                >
                    <span className="mr-2">+</span> New Report
                </Link>
            </div>

            <ReportsTable reports={reports} />
        </div>
    );
}
