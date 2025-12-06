import { getOwnerStats } from "@/actions/dashboard";

import { ProductionChart } from "@/components/dashboard/ProductionChart";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { CrewDispatch } from "@/components/financials/CrewDispatch";
import { getAvailableCrewMembers } from "@/actions/employees";
import { getAssets } from "@/actions/assets";
import { getActiveProjects } from "@/actions/projects";
import { ExpiringTicketsWidget } from "@/components/dashboard/ExpiringTicketsWidget";

export default async function OwnerDashboard() {
    const [statsRes, { data: employees }, res, { data: projects }] = await Promise.all([
        getOwnerStats(),
        getAvailableCrewMembers(),
        getAssets(),
        getActiveProjects()
    ]);
    const assets = res.success && res.data ? res.data : [];
    const stats = statsRes.data || {
        activeProjects: 0,
        totalRevenue: 0,
        pendingApprovals: 0,
        inventoryValue: 0,
        activeFleet: 0,
        openSafetyIssues: 0
    };

    return (
        <div className="p-8 space-y-8">
            <div className="border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">OWNERSHIP DASHBOARD</h1>
                {/* Rebuild Trigger */}
                <p className="text-gray-500 mt-1">Financial & Project Overview</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border-t-4 border-blue-900 dark:border-blue-400 shadow-sm border-x border-b border-gray-200 dark:border-slate-700">
                    <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Active Projects</h3>
                    <p className="text-4xl font-extrabold text-gray-900 dark:text-white mt-2">{stats.activeProjects}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border-t-4 border-green-600 shadow-sm border-x border-b border-gray-200 dark:border-slate-700">
                    <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Total Revenue (Est)</h3>
                    <p className="text-4xl font-extrabold text-green-700 dark:text-green-500 mt-2">
                        ${stats.totalRevenue.toLocaleString()}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border-t-4 border-yellow-500 shadow-sm border-x border-b border-gray-200 dark:border-slate-700">
                    <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Pending Approvals</h3>
                    <p className="text-4xl font-extrabold text-gray-900 dark:text-white mt-2">{stats.pendingApprovals}</p>
                </div>

                {/* New Widgets */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border-t-4 border-blue-500 shadow-sm border-x border-b border-gray-200 dark:border-slate-700">
                    <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Inventory Value</h3>
                    <p className="text-4xl font-extrabold text-gray-900 dark:text-white mt-2">
                        ${stats.inventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border-t-4 border-indigo-500 shadow-sm border-x border-b border-gray-200 dark:border-slate-700">
                    <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Active Fleet</h3>
                    <p className="text-4xl font-extrabold text-gray-900 dark:text-white mt-2">{stats.activeFleet}</p>
                </div>
                <div className={`bg-white dark:bg-slate-800 p-6 rounded-lg border-t-4 shadow-sm border-x border-b border-gray-200 dark:border-slate-700 ${stats.openSafetyIssues > 0 ? 'border-red-500' : 'border-green-500'}`}>
                    <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Open Safety Issues</h3>
                    <p className={`text-4xl font-extrabold mt-2 ${stats.openSafetyIssues > 0 ? 'text-red-600 dark:text-red-500' : 'text-green-600 dark:text-green-500'}`}>
                        {stats.openSafetyIssues}
                    </p>
                </div>
            </div>

            {/* Alerts & Activity Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 h-full">
                    <ExpiringTicketsWidget />
                </div>
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm h-full">
                        <h2 className="text-xl font-bold mb-4 text-blue-900 dark:text-blue-400 flex items-center">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                            Recent Activity
                        </h2>
                        <p className="text-gray-500 italic">No recent activity to display.</p>
                    </div>
                </div>
            </div>

            {/* Charts & Maps Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Production Chart */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Weekly Production</h3>
                    <ProductionChart />
                </div>

                {/* Active Operations Map Widget */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Active Operations Map</h3>
                        <Link href="/dashboard/map" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                            View Full Map &rarr;
                        </Link>
                    </div>
                    <div className="flex-1 bg-gray-100 dark:bg-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer">
                        {/* Mock Map Background */}
                        <div className="absolute inset-0 bg-[url('/satellite_map_mock.png')] bg-cover bg-center opacity-50 group-hover:opacity-75 transition-opacity"></div>
                        <div className="relative z-10 text-center">
                            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-lg mb-2 inline-flex items-center justify-center w-16 h-16">
                                <MapPin className="h-8 w-8 text-blue-600" />
                            </div>
                            <p className="font-medium text-gray-900">2 Active Sites</p>
                            <p className="text-xs text-gray-500">Willmar, MN • Spicer, MN</p>
                        </div>
                    </div>
                </div>
            </div>



            <div className="mt-8">
                <CrewDispatch
                    variant="owner"
                    employees={employees || []}
                    assets={assets || []}
                    projects={projects || []}
                />
            </div>
        </div>
    );
}
