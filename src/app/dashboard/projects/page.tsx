import { getProjects } from "@/app/actions/projects";
import Link from "next/link";
import { Calendar, MapPin, Activity } from "lucide-react";

export default async function ProjectsPage() {
    const projects = await getProjects();

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-[#003366] uppercase tracking-tight">Projects</h1>
                    <p className="text-gray-500 mt-1">Manage and track all active jobs</p>
                </div>
                <Link
                    href="/dashboard/projects/new"
                    className="bg-[#003366] hover:bg-[#002244] text-white px-6 py-3 rounded font-bold shadow-sm transition-colors flex items-center"
                >
                    <span className="mr-2">+</span> New Project
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <Link
                        key={project.id}
                        href={`/dashboard/projects/${project.id}`}
                        className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:border-[#003366] transition-all duration-200 overflow-hidden hover:shadow-md"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#003366] transition-colors">
                                    {project.name}
                                </h3>
                                <span
                                    className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${project.status === "IN_PROGRESS"
                                        ? "bg-green-100 text-green-800"
                                        : project.status === "PLANNING"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-gray-100 text-gray-800"
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
        </div>
    );
}
