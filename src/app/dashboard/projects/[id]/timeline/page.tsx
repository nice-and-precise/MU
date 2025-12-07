import ProjectTimeline from '@/components/projects/ProjectTimeline';
import { notFound } from 'next/navigation';
import { TimelineTour } from '@/components/projects/TimelineTour';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ProjectTimelinePage({ params }: PageProps) {
    const { id } = await params;

    if (!id) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Project Timeline</h2>
                        <p className="text-muted-foreground">
                            Chronological history of estimates, operations, and quality events.
                        </p>
                    </div>
                    <TimelineTour />
                </div>
            </div>
            <ProjectTimeline projectId={id} />
        </div>
    );
}
