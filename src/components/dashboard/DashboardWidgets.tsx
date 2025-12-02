"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, DollarSign, Users, Clock } from "lucide-react";

export function TicketWidget({ count }: { count: number }) {
    return (
        <Card className={count > 0 ? "border-red-500 bg-red-50" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expiring Tickets (48h)</CardTitle>
                <AlertTriangle className={`h-4 w-4 ${count > 0 ? "text-red-600" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${count > 0 ? "text-red-700" : ""}`}>{count}</div>
                <p className="text-xs text-muted-foreground">811 Tickets needing attention</p>
            </CardContent>
        </Card>
    );
}

export function BurnRateWidget({ rate }: { rate: number }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Live Burn Rate</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">${rate.toFixed(2)}/hr</div>
                <p className="text-xs text-muted-foreground">Current operational cost</p>
            </CardContent>
        </Card>
    );
}

export function CrewStatusWidget({ clockedIn, total }: { clockedIn: number; total: number }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Crew Status</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{clockedIn} / {total}</div>
                <p className="text-xs text-muted-foreground">Employees Clocked In</p>
            </CardContent>
        </Card>
    );
}
