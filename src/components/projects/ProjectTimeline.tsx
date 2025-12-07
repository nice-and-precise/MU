'use client';

import { useEffect, useState } from 'react';
import { getProjectTimeline } from '@/actions/projects';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, FileText, Activity, AlertCircle, CheckCircle2, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProjectTimelineProps {
    projectId: string;
}

type TimelineEvent = {
    id: string;
    type: 'PROJECT' | 'ESTIMATE' | 'BORE' | 'QC_OPEN' | 'QC_CLOSE';
    date: Date;
    title: string;
    description: string;
    status?: string;
    metadata?: any;
};

export default function ProjectTimeline({ projectId }: ProjectTimelineProps) {
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<TimelineEvent[]>([]);

    useEffect(() => {
        async function loadTimeline() {
            try {
                const res = await getProjectTimeline(projectId);
                if (res?.data) {
                    const data = res.data;
                    const allEvents: TimelineEvent[] = [];

                    // Project Created
                    if (data.project) {
                        allEvents.push({
                            id: `proj-${data.project.id}`,
                            type: 'PROJECT',
                            date: new Date(data.project.createdAt),
                            title: 'Project Created',
                            description: `Project "${data.project.name}" initialized.`,
                            status: data.project.status
                        });
                    }

                    // Estimates
                    data.estimates.forEach(est => {
                        allEvents.push({
                            id: `est-${est.id}`,
                            type: 'ESTIMATE',
                            date: new Date(est.createdAt),
                            title: 'Estimate Created',
                            description: `Estimate "${est.name}" created ($${est.total.toLocaleString()}).`,
                            status: est.status
                        });
                    });

                    // Bores
                    data.bores.forEach(bore => {
                        allEvents.push({
                            id: `bore-${bore.id}`,
                            type: 'BORE',
                            date: new Date(bore.createdAt),
                            title: 'Bore Planned',
                            description: `Bore "${bore.name}" added to plan.`,
                            status: bore.status
                        });

                        // If completed or in progress, maybe use updatedAt as a proxy for an update event?
                        // For now, let's just show creation to avoid noise unless we have specific dates.
                    });

                    // QC Items
                    data.punchItems.forEach(item => {
                        allEvents.push({
                            id: `qc-${item.id}`,
                            type: 'QC_OPEN',
                            date: new Date(item.createdAt),
                            title: 'QC Item Raised',
                            description: `Item: ${item.title}`,
                            status: item.status
                        });

                        if (item.completedAt && item.status === 'COMPLETED') {
                            allEvents.push({
                                id: `qc-done-${item.id}`,
                                type: 'QC_CLOSE',
                                date: new Date(item.completedAt),
                                title: 'QC Item Resolved',
                                description: `Resolved: ${item.title}`,
                                status: 'COMPLETED'
                            });
                        }
                    });

                    // Sort descending
                    allEvents.sort((a, b) => b.date.getTime() - a.date.getTime());
                    setEvents(allEvents);
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to load timeline");
            } finally {
                setLoading(false);
            }
        }

        loadTimeline();
    }, [projectId]);

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
    }

    if (events.length === 0) {
        return <div className="text-center p-12 text-muted-foreground">No events found for this project.</div>;
    }

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0">
                <div className="relative border-l border-border ml-3 space-y-8 py-4">
                    {events.map((event, index) => (
                        <div key={event.id} className="relative pl-8 group">
                            {/* Icon Bubble */}
                            <div className={cn(
                                "absolute -left-[21px] flex h-10 w-10 items-center justify-center rounded-full border bg-background shadow-sm transition-transform group-hover:scale-110",
                                event.type === 'PROJECT' && "border-blue-500 text-blue-600 dark:text-blue-400",
                                event.type === 'ESTIMATE' && "border-purple-500 text-purple-600 dark:text-purple-400",
                                event.type === 'BORE' && "border-amber-500 text-amber-600 dark:text-amber-400",
                                event.type === 'QC_OPEN' && "border-red-500 text-red-600 dark:text-red-400",
                                event.type === 'QC_CLOSE' && "border-green-500 text-green-600 dark:text-green-400",
                            )}>
                                {event.type === 'PROJECT' && <Calendar className="w-5 h-5" />}
                                {event.type === 'ESTIMATE' && <FileText className="w-5 h-5" />}
                                {event.type === 'BORE' && <Activity className="w-5 h-5" />}
                                {event.type === 'QC_OPEN' && <AlertCircle className="w-5 h-5" />}
                                {event.type === 'QC_CLOSE' && <CheckCircle2 className="w-5 h-5" />}
                            </div>

                            {/* Content Card */}
                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 hover:shadow-md transition-shadow">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                                    <h4 className="font-semibold text-sm">{event.title}</h4>
                                    <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                                        {format(event.date, "PPp")}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                    {event.description}
                                </p>
                                {event.status && (
                                    <Badge variant="secondary" className="text-xs font-normal">
                                        {event.status}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
