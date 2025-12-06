"use client";

import React from "react";
import { EmploymentStatusHistory } from "@prisma/client";
import { format } from "date-fns";
import { Circle, ArrowDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface EmploymentTimelineProps {
    history: EmploymentStatusHistory[];
}

export function EmploymentTimeline({ history }: EmploymentTimelineProps) {
    if (!history || history.length === 0) {
        return (
            <div className="text-muted-foreground text-sm italic">
                No history recorded.
            </div>
        );
    }

    return (
        <div className="relative border-l-2 border-muted ml-3 space-y-6 py-2">
            {history.map((item, index) => (
                <div key={item.id} className="relative pl-6">
                    <Circle className={`absolute -left-[9px] h-4 w-4 fill-background text-primary ${index === 0 ? "text-green-600 border-green-600" : ""}`} />
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm">{item.status}</span>
                        <span className="text-xs text-muted-foreground">
                            {format(new Date(item.effectiveDate), "MMM d, yyyy")}
                        </span>
                        {item.reason && (
                            <span className="text-xs mt-1 bg-muted/50 p-1 rounded w-fit">
                                {item.reason}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

export function EmploymentTimelineCard({ history }: EmploymentTimelineProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Employment History</CardTitle>
            </CardHeader>
            <CardContent>
                <EmploymentTimeline history={history} />
            </CardContent>
        </Card>
    )
}
