import { getProjects } from "@/app/actions/projects";
import Link from "next/link";
import { Calendar, MapPin, Activity } from "lucide-react";

export default async function ProjectsPage() {
    const projects = await getProjects();

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
                    <p className="text-gray-500 mt-1">Manage and track all active jobs</p>
                </div>
                <Link
                    href="/dashboard/projects/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors font-medium"
                >
                    New Project
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <Link
                        key={project.id}
                        href={`/dashboard/projects/${project.id}`}
                        className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">
                                    {project.name}
                                </h3>
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${project.status === "IN_PROGRESS"
                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                            : project.status === "PLANNING"
                                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                        }`}
                                >
                                    {project.status.replace("_", " ")}
                                </span>
                            </div>

                            <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                                {project.description || "No description provided."}
                            </p>

                            <div className="space-y-3">
                                <div className="flex items-center text-sm text-gray-500">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    <span className="truncate">
                                        {project.location ? JSON.parse(project.location as string).city : "Location N/A"}
                                    </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    <span>
                                        {project.startDate
                                            ? new Date(project.startDate).toLocaleDateString()
                                            : "TBD"}
                                    </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <Activity className="h-4 w-4 mr-2" />
                                    <span>
                                        {project._count.bores} Bores • {project._count.dailyReports} Reports
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <span className="text-xs text-gray-500 font-medium">View Details</span>
                            <span className="text-blue-500 text-sm">→</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
