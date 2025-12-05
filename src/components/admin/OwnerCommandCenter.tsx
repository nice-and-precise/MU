'use client';

import React, { useEffect, useState } from "react";
import { KPICards } from "./KPICards";
import { ActiveCrewsList } from "./ActiveCrewsList";
import { RecentActivityFeed } from "./RecentActivityFeed";
import { ProductionChart } from "@/components/dashboard/ProductionChart";
import { LiveFleetMap } from "@/components/tracking/LiveFleetMap";
import { getDashboardStats, getRecentActivity, getActiveCrews } from "@/actions/dashboard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function OwnerCommandCenter() {
    const [stats, setStats] = useState<any>(null);
    const [activity, setActivity] = useState<any[]>([]);
    const [crews, setCrews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsData, activityData, crewsData] = await Promise.all([
                getDashboardStats(),
                getRecentActivity(),
                getActiveCrews()
            ]);
            setStats(statsData);
            if (activityData.success && activityData.data) {
                setActivity(activityData.data);
            }
            if (crewsData.success && crewsData.data) {
                setCrews(crewsData.data);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading && !stats) {
        return <div className="p-8 flex justify-center items-center h-screen">Loading Command Center...</div>;
    }

    return (
        <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-slate-900 dark:text-white">Operations Command</h1>
                    <p className="text-muted-foreground">Real-time overview of field operations</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchData} variant="outline" size="sm">
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            {stats && <KPICards stats={stats} />}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Map Area */}
                <div className="lg:col-span-2 h-[500px] bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b dark:border-slate-800 font-bold">Live Operations Map</div>
                    <div className="flex-1 relative">
                        <LiveFleetMap />
                    </div>
                </div>

                {/* Production Chart */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800 shadow-sm p-4">
                        <h3 className="font-bold mb-4">Weekly Production</h3>
                        <ProductionChart />
                    </div>

                    {/* Active Crews List */}
                    <ActiveCrewsList crews={crews} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <RecentActivityFeed activity={activity} />

                {/* Quick Actions / Alerts Placeholder */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800 shadow-sm p-6">
                    <h3 className="font-bold mb-4">System Status</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900">
                            <span className="font-medium text-green-900 dark:text-green-100">API Status</span>
                            <span className="text-sm font-bold text-green-600 dark:text-green-400">Operational</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900">
                            <span className="font-medium text-blue-900 dark:text-blue-100">Database</span>
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">Connected</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border dark:border-slate-700">
                            <span className="font-medium">Last Backup</span>
                            <span className="text-sm text-muted-foreground">2 hours ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
