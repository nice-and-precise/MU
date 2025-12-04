import { PrismaClient } from "@prisma/client";
import DailyReportForm from "@/components/DailyReportForm";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const prisma = new PrismaClient();

async function getActiveProjects() {
    return await prisma.project.findMany({
        where: { status: "IN_PROGRESS" },
        select: { id: true, name: true },
    });
}

export default async function NewReportPage() {
    const projects = await getActiveProjects();

    return (
        <div className="max-w-2xl mx-auto p-8">
            <div className="mb-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard/reports">Reports</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>New Report</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">New Daily Report</h1>
            <DailyReportForm projects={projects} />
        </div>
    );
}
