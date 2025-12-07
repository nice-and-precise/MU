import { getProject, getProjectLaborStats } from "@/actions/projects";
import { getProjectSummary } from "@/actions/closeout";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DollarSign, FileText, ShieldCheck, CheckSquare, HardHat } from "lucide-react";
import { LinearProgressBar } from "@/components/projects/LinearProgressBar";
import DataImportDropzone from "@/components/import/DataImportDropzone";
import CloseoutModal from "@/components/closeout/CloseoutModal";
import { TicketManager } from "@/components/safety/TicketManager";

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [projectRes, summaryRes, laborRes] = await Promise.all([
        getProject(id),
        getProjectSummary(id),
        getProjectLaborStats(id)
    ]);
    const project = projectRes?.data;
    const summary = summaryRes?.data;
    const laborStats = laborRes?.data;

    if (!project || !summary) {
        notFound();
    }

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center text-gray-500 mb-2">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Financials</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {summary.financials.percentBilled.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Invoiced of Budget</p>
                </div>

                {/* Labor Stats Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center text-gray-500 mb-2">
                        <HardHat className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Labor Cost</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${laborStats?.actualLaborCost.toLocaleString() || '0'}
                    </p>
                    <div className="flex justify-between items-center text-xs mt-1">
                        <span className="text-gray-500">Est. Budget:</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                            ${laborStats?.estimatedLaborBudget.toLocaleString() || '0'}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div
                            className={`bg-blue-600 h-1.5 rounded-full`}
                            style={{
                                width: `${Math.min(100, ((laborStats?.actualLaborCost || 0) / (laborStats?.estimatedLaborBudget || 1)) * 100)}%`
                            }}
                        ></div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center text-gray-500 mb-2">
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Safety</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {summary.safety.meetings}
                    </p>
                    <p className="text-xs text-muted-foreground">Safety Meetings</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center text-gray-500 mb-2">
                        <CheckSquare className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">QC Items</span>
                    </div>
                    <p className={`text-2xl font-bold ${summary.qc.openPunchItems > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {summary.qc.openPunchItems}
                    </p>
                    <p className="text-xs text-muted-foreground">Open Punch Items</p>
                </div>
            </div>

            {/* Linear Progress Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
                <LinearProgressBar
                    projectId={project.id}
                    totalLength={project.bores.reduce((acc, bore) => acc + (bore.totalLength || 0), 0) || 1000}
                    progressData={project.stationProgress || []}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Data Import Section */}
                    <DataImportDropzone projectId={project.id} />

                    {/* Bores List */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Bores</h2>
                        <div className="space-y-4">
                            {project.bores.map((bore) => (
                                <div key={bore.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">{bore.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            {bore.totalLength} LF • {bore.productMaterial}
                                        </p>
                                    </div>
                                    <span className="px-2 py-1 bg-white dark:bg-gray-600 rounded text-xs font-medium border border-gray-200 dark:border-gray-500">
                                        {bore.status}
                                    </span>
                                </div>
                            ))}
                            {project.bores.length === 0 && (
                                <p className="text-gray-500 text-sm text-center py-4">No bores defined yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Reports */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Reports</h2>
                        <div className="space-y-4">
                            {project.dailyReports.map((report) => (
                                <Link
                                    key={report.id}
                                    href={`/dashboard/reports/${report.id}`}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                                >
                                    <div className="flex items-center">
                                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {new Date(report.reportDate).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm text-gray-500 truncate max-w-xs">{report.notes}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-gray-500">{report.status}</span>
                                </Link>
                            ))}
                            {project.dailyReports.length === 0 && (
                                <p className="text-gray-500 text-sm text-center py-4">No reports submitted yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: 811 & Actions */}
                <div className="space-y-6">
                    <div className="h-[500px]">
                        <TicketManager
                            projectId={project.id}
                            initialTickets={project.tickets811.map(t => ({
                                id: t.id,
                                number: t.ticketNumber,
                                project: project.name,
                                expiration: t.expirationDate.toISOString(),
                                status: t.status === 'ACTIVE' ? 'Active' : 'Expired'
                            }))}
                        />
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
                        <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Quick Actions</h3>
                        <div className="space-y-2">
                            <Link href={`/dashboard/projects/${project.id}/safety`} className="block w-full text-left px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm">
                                + Safety Meeting
                            </Link>
                            <Link href={`/dashboard/projects/${project.id}/production`} className="block w-full text-left px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm">
                                + Add Bore
                            </Link>
                            <Link href={`/dashboard/projects/${project.id}/qc`} className="block w-full text-left px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm">
                                + Log Punch Item
                            </Link>
                        </div>
                    </div>

                    <CloseoutModal projectId={project.id} summary={summary} />
                </div>
            </div>
        </div>
    );
}
