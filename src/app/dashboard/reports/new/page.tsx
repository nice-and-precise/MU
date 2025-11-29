import { PrismaClient } from "@prisma/client";
import DailyReportForm from "@/components/DailyReportForm";

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">New Daily Report</h1>
            <DailyReportForm projects={projects} />
        </div>
    );
}
