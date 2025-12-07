'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Users, MapPin } from "lucide-react";

interface Crew {
    id: string;
    name: string;
    foreman: string;
    status: string;
    location: string;
}

interface ActiveCrewsListProps {
    crews: Crew[];
}

export function ActiveCrewsList({ crews }: ActiveCrewsListProps) {
    return (
        <Card className="h-full bg-white dark:bg-slate-900 shadow-sm border dark:border-slate-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                    Active Crews
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {crews.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No active crews found.</p>
                    ) : (
                        crews.map((crew) => (
                            <div key={crew.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border dark:border-slate-700">
                                <div className="space-y-1">
                                    <div className="font-bold text-sm text-slate-900 dark:text-white">{crew.name}</div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {crew.location}
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <StatusBadge status={crew.status} />
                                    <div className="text-sm text-muted-foreground">{crew.foreman}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
