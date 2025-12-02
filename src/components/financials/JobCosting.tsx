"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjectBurnRate } from "@/actions/financials";
import { DollarSign, Activity, Hammer, Truck } from "lucide-react";

interface JobCostingProps {
    projectId: string;
}

export function JobCosting({ projectId }: JobCostingProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const res = await getProjectBurnRate(projectId);
            if (res.success) {
                setData(res.data);
            }
            setLoading(false);
        }
        loadData();
    }, [projectId]);

    if (loading) return <div>Loading Financials...</div>;
    if (!data) return <div>No financial data available.</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Job Cost</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${data.totalCost.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Labor + Machine</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Labor Cost</CardTitle>
                    <Hammer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${data.totalLaborCost.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">{data.totalManHours} Man Hours</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Machine Cost</CardTitle>
                    <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${data.totalMachineCost.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">{data.drillHours} Drill Hours @ ${data.machineRate}/hr</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Burn Rate / Hr</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        ${data.drillHours > 0 ? (data.totalCost / data.drillHours).toFixed(2) : "0.00"}
                    </div>
                    <p className="text-xs text-muted-foreground">Cost per Drill Hour</p>
                </CardContent>
            </Card>
        </div>
    );
}
