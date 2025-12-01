import { getProject } from "@/app/actions/projects";
import { notFound } from "next/navigation";
import Link from "next/link";
import BoreList from "@/components/drilling/BoreList";
import { prisma } from "@/lib/prisma";

export default async function ProjectProductionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const project = await getProject(id);

    if (!project) {
        notFound();
    }

    // Fetch bores separately to include rod count
    const bores = await prisma.bore.findMany({
        where: { projectId: id },
        include: { rodPasses: { select: { id: true } } },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                    <Link href="/dashboard/projects" className="hover:text-blue-500">Projects</Link>
                    <span>/</span>
                    <Link href={`/dashboard/projects/${project.id}`} className="hover:text-blue-500">{project.name}</Link>
                    <span>/</span>
                    <span>Production</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Production Logging</h1>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-8 w-fit">
                <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="px-4 py-2 text-sm font-medium rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors"
                >
                    Overview
                </Link>
                <Link
                    href={`/dashboard/projects/${project.id}/financials`}
                    className="px-4 py-2 text-sm font-medium rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors"
                >
                    Financials
                </Link>
                <Link
                    href={`/dashboard/projects/${project.id}/production`}
                    className="px-4 py-2 text-sm font-medium rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                >
                    Production
                </Link>
                <Link
                    href={`/dashboard/projects/${project.id}/changes`}
                    className="px-4 py-2 text-sm font-medium rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors"
                >
                    Changes
                </Link>
                <Link
                    href={`/dashboard/projects/${project.id}/invoicing`}
                    className="px-4 py-2 text-sm font-medium rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors"
                >
                    Invoicing
                </Link>
            </div>

            <BoreList projectId={project.id} bores={bores} />
        </div>
    );
}
