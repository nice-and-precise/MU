import { getOwnerStats } from "@/app/actions/dashboard";

import { ProductionChart } from "@/components/dashboard/ProductionChart";
import { MapPin } from "lucide-react";
import Link from "next/link";

export default async function OwnerDashboard() {
    const stats = await getOwnerStats();

    return (
        <div className="p-8 space-y-8">
            <div className="border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-bold text-[#003366] uppercase tracking-tight">Owner Dashboard</h1>
                <p className="text-gray-500 mt-1">Financial & Project Overview</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border-t-4 border-[#003366] shadow-sm border-x border-b border-gray-200">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Active Projects</h3>
                    <p className="text-4xl font-extrabold text-gray-900 mt-2">{stats.activeProjects}</p>
                </div>
                <div className="bg-white p-6 rounded-lg border-t-4 border-green-600 shadow-sm border-x border-b border-gray-200">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Revenue (Est)</h3>
                    <p className="text-4xl font-extrabold text-green-700 mt-2">
                        ${stats.totalRevenue.toLocaleString()}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg border-t-4 border-yellow-500 shadow-sm border-x border-b border-gray-200">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Pending Approvals</h3>
                    <p className="text-4xl font-extrabold text-gray-900 mt-2">{stats.pendingApprovals}</p>
                </div>
            </div>

            {/* Charts & Maps Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Production Chart */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Production</h3>
                    <ProductionChart />
                </div>

                {/* Active Operations Map Widget */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Active Operations Map</h3>
                        <Link href="/dashboard/map" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                            View Full Map &rarr;
                        </Link>
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer">
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
                <h2 className="text-xl font-bold mb-4 text-[#003366] flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    Recent Activity
                </h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <p className="text-gray-500 italic">No recent activity to display.</p>
                </div>
            </div>
        </div>
    );
}
