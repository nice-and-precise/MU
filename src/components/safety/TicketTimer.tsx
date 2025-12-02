"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Clock } from "lucide-react";
import { differenceInHours, format } from "date-fns";

interface TicketTimerProps {
    expirationDate: Date;
    ticketNumber: string;
}

export function TicketTimer({ expirationDate, ticketNumber }: TicketTimerProps) {
    const hoursRemaining = differenceInHours(new Date(expirationDate), new Date());
    const isCritical = hoursRemaining < 48;
    const isExpired = hoursRemaining <= 0;

    if (!isCritical && !isExpired) return null; // Don't show if plenty of time

    return (
        <Card className={`border-l-8 ${isExpired ? "border-l-red-600 bg-red-50" : "border-l-orange-500 bg-orange-50"}`}>
            <CardContent className="p-4 flex items-center gap-4">
                {isExpired ? (
                    <AlertTriangle className="h-10 w-10 text-red-600" />
                ) : (
                    <Clock className="h-10 w-10 text-orange-500" />
                )}
                <div>
                    <h3 className={`font-bold text-lg ${isExpired ? "text-red-700" : "text-orange-700"}`}>
                        {isExpired ? "811 TICKET EXPIRED" : "811 TICKET EXPIRING SOON"}
                    </h3>
                    <p className="text-sm text-gray-700">
                        Ticket #{ticketNumber} expires on {format(new Date(expirationDate), "MMM d, yyyy HH:mm")}
                    </p>
                    <p className="font-bold mt-1">
                        {isExpired ? "DO NOT DIG." : `${hoursRemaining} hours remaining.`}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
