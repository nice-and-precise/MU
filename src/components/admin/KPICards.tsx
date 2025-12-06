'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, AlertTriangle, DollarSign } from "lucide-react";

interface KPICardsProps {
    stats: {
        activeProjects: number;
        activeTickets: number;
        totalAssets: number;
        deployedAssets: number;
        activeCrews: number;
        totalEmployees: number;
        laborCostPerHour?: number;
        laborCostPerFoot?: number;
        qcOpenLast7Days?: number;
    };
}

export function KPICards({ stats }: KPICardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            <Card className="bg-white dark:bg-slate-900 border-l-4 border-l-blue-500 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
                    <Activity className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.activeProjects}</div>
                    <p className="text-xs text-muted-foreground">
                        {stats.activeCrews} Active Crews
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border-l-4 border-l-emerald-500 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Asset Utilization</CardTitle>
                    <Users className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {Math.round((stats.deployedAssets / (stats.totalAssets || 1)) * 100)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {stats.deployedAssets} / {stats.totalAssets} Deployed
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border-l-4 border-l-orange-500 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Open Tickets</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.activeTickets}</div>
                    <p className="text-xs text-muted-foreground">
                        Requires Attention
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border-l-4 border-l-red-500 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">New QC Items (7d)</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.qcOpenLast7Days || 0}</div>
                    <p className="text-xs text-muted-foreground">
                        Open items from this week
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border-l-4 border-l-purple-500 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Est. Daily Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        ${(stats.activeCrews * 3500).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Based on run rate
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border-l-4 border-l-pink-500 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Labor Efficiency</CardTitle>
                    <Activity className="h-4 w-4 text-pink-500" />
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                ${stats.laborCostPerFoot?.toFixed(2) || '0.00'}<span className="text-sm font-normal text-muted-foreground ml-1">/ft</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Est. Labor Cost</p>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-slate-700 dark:text-slate-300">
                                ${stats.laborCostPerHour?.toLocaleString() || '0'}/hr
                            </div>
                            <p className="text-sm text-muted-foreground">Total Burn Rate</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
