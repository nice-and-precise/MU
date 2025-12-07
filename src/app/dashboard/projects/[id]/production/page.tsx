import { getProject } from "@/actions/projects";
import { notFound } from "next/navigation";
import Link from "next/link";
import BoreList from "@/components/drilling/BoreList";
import { prisma } from "@/lib/prisma";

export default async function ProjectProductionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const res = await getProject(id);
    const project = res?.data;

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
        <div className="space-y-6">

            <BoreList projectId={project.id} bores={bores} />
        </div>
    );
}
