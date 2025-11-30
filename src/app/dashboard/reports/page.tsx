import { getReports } from "@/app/actions/reports";
import Link from "next/link";
import { FileText, User, Calendar } from "lucide-react";

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

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-700 font-bold uppercase tracking-wider border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Project</th>
                                <th className="px-6 py-4">Submitted By</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {reports.map((report) => (
                                <tr key={report.id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="px-6 py-4 text-gray-900 font-medium">
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                            {new Date(report.reportDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {report.project.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <div className="flex items-center">
                                            <User className="h-4 w-4 mr-2 text-gray-400" />
                                            {report.createdBy.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
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
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/dashboard/reports/${report.id}`}
                                            className="text-[#003366] hover:text-[#002244] font-bold hover:underline"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
