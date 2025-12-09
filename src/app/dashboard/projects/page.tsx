import { getProjects } from "@/actions/projects";
import Link from "next/link";
import { Calendar, MapPin, Activity } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
    const { tab } = await searchParams;
    const activeTab = tab === 'archived' ? 'archived' : 'active';

    const statusFilter = activeTab === 'active'
        ? ['PLANNING', 'IN_PROGRESS']
        : ['COMPLETED', 'ARCHIVED'];

    const res = await getProjects({ status: statusFilter });

    if (!res.data) {
        return <div className="p-8">Error loading projects.</div>;
    }

    const projects = res.data;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-tight">Projects</h1>
                    <p className="text-gray-500 mt-1">Manage and track all {activeTab} jobs</p>
                </div>
                <Link
                    href="/dashboard/projects/new"
                    className="bg-charcoal hover:bg-black text-white px-6 py-3 rounded font-bold shadow-sm transition-colors flex items-center"
                >
                    <span className="mr-2">+</span> New Project
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex space-x-6 mb-8 border-b border-gray-200">
                <Link
                    href="/dashboard/projects?tab=active"
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'active'
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    Active Projects
                </Link>
                <Link
                    href="/dashboard/projects?tab=archived"
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'archived'
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    Archived
                </Link>
            </div>

            {projects.length === 0 ? (
                <div className="mt-12">
                    <EmptyState
                        title={`No ${activeTab} projects found`}
                        description={activeTab === 'active'
                            ? "Get started by creating your first project to track bores, costs, and daily reports."
                            : "No projects have been archived yet."}
                        actionLabel={activeTab === 'active' ? "Create Project" : undefined}
                        actionHref="/dashboard/projects/new"
                        icon={MapPin}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Link
                            key={project.id}
                            href={`/dashboard/projects/${project.id}`}
                            className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:border-charcoal transition-all duration-200 overflow-hidden hover:shadow-md"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-charcoal transition-colors">
                                        {project.name}
                                    </h3>
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${project.status === "IN_PROGRESS"
                                            ? "bg-green-100 text-green-800"
                                            : project.status === "PLANNING"
                                                ? "bg-blue-100 text-blue-800"
                                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                                            }`}
                                    >
                                        {project.status.replace("_", " ")}
                                    </span>
                                </div>

                                <p className="text-gray-500 text-sm mb-6 line-clamp-2 font-medium">
                                    {project.description || "No description provided."}
                                </p>

                                <div className="space-y-3 border-t border-gray-100 pt-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <MapPin className="h-4 w-4 mr-2 text-yellow-500" />
                                        <span className="truncate font-medium">
                                            {project.location || "Location N/A"}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                        <span>
                                            {project.startDate
                                                ? new Date(project.startDate).toLocaleDateString()
                                                : "TBD"}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Activity className="h-4 w-4 mr-2 text-gray-400" />
                                        <span>
                                            {project._count.bores} Bores • {project._count.dailyReports} Reports
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
