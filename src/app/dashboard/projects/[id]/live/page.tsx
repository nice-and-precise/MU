import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import LiveTelemetry from "@/components/drilling/LiveTelemetry";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function LiveDashboardPage({ params }: PageProps) {
    const { id } = await params;

    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            bores: true,
        },
    });

    if (!project) {
        notFound();
    }

    // For now, just pick the first bore or the one marked "IN_PROGRESS"
    // If no bores, we can't show live telemetry
    const activeBore = project.bores[0];

    return (
        <div className="flex flex-col h-full p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Live Operations</h1>
                    <p className="text-muted-foreground">
                        Real-time telemetry for {project.name}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    {/* Status Indicator */}
                    <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-medium text-green-600">Live Connection</span>
                </div>
            </div>

            {activeBore ? (
                <LiveTelemetry boreId={activeBore.id} />
            ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No active bore found for this project.</p>
                </div>
            )}
        </div>
    );
}
