import { getProject } from "@/actions/projects";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ProjectTabs } from "@/components/projects/ProjectTabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ProjectLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const res = await getProject(id);
    const project = res?.data;

    if (!project) {
        notFound();
    }

    return (
        <div className="p-8">
            <PageHeader
                title={project.name}
                breadcrumbs={[
                    { title: "Projects", href: "/dashboard/projects" },
                    { title: project.name }
                ]}
                status={
                    <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${project.status === "IN_PROGRESS"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : project.status === "ARCHIVED"
                                    ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                    : "bg-blue-100 text-blue-700"
                            }`}
                    >
                        {project.status.replace("_", " ")}
                    </span>
                }
                actions={
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/projects">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Projects
                        </Link>
                    </Button>
                }
            />

            <ProjectTabs projectId={project.id} />

            {children}
        </div>
    );
}
