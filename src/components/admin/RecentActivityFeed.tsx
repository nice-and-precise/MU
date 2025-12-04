'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
    id: string;
    type: string;
    title: string;
    date: Date;
    user: string;
    status: string;
}

interface RecentActivityFeedProps {
    activity: ActivityItem[];
}

export function RecentActivityFeed({ activity }: RecentActivityFeedProps) {
    return (
        <Card className="h-full bg-white dark:bg-slate-900 shadow-sm border dark:border-slate-800">
            <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activity.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
                    ) : (
                        activity.map((item) => (
                            <div key={item.id} className="flex gap-3 items-start pb-3 border-b last:border-0 dark:border-slate-800">
                                <div className={`mt-1 p-1.5 rounded-full ${item.type === 'TICKET' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                    item.type === 'INCIDENT' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                        'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                    }`}>
                                    {item.type === 'TICKET' && <FileText className="h-4 w-4" />}
                                    {item.type === 'INCIDENT' && <AlertTriangle className="h-4 w-4" />}
                                    {item.type === 'REPORT' && <CheckCircle className="h-4 w-4" />}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</div>
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>{item.user}</span>
                                        <span>{formatDistanceToNow(new Date(item.date), { addSuffix: true })}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
