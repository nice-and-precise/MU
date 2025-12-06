import { ComplianceTab } from "@/components/216d/ComplianceTab";
import { ComplianceTimeline } from "@/components/216d/ComplianceTimeline";
import { getProject } from "@/actions/projects";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { export216dPacket } from "@/actions/216d/export";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default async function ProjectCompliancePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const res = await getProject(id);
    const project = res?.data;

    if (!project) {
        notFound();
    }

    // Fetch compliance events (mock or real if getProject includes them)
    // Assuming project.complianceEvents is available or we fetch it separately
    // For now, let's assume getProject doesn't include them and we pass empty or fetch.
    // Ideally we update getProject or fetch here.
    // Let's just pass empty for now to avoid breaking if getProject isn't updated.
    const events = (project as any).complianceEvents || [];

    return (
        <div className="p-8">
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <Breadcrumb className="mb-2">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/dashboard/projects">Projects</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/dashboard/projects/${id}`}>{project.name}</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>216D Compliance</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">216D Compliance</h1>
                    <p className="text-gray-500 mt-1">Manage GSOC tickets, white lining, and meet requirements.</p>
                </div>
                <form action={async () => {
                    'use server';
                    await export216dPacket(id);
                }}>
                    <Button type="submit" variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Export Packet
                    </Button>
                </form>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <ComplianceTab projectId={id} />
                </div>
                <div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Compliance Timeline</h2>
                        <ComplianceTimeline events={events} />
                    </div>
                </div>
            </div>
        </div>
    );
}
