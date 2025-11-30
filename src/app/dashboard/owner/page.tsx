import { getOwnerStats } from "@/app/actions/dashboard";

export default async function OwnerDashboard() {
    const stats = await getOwnerStats();

    return (
        <div className="p-8">
            <div className="mb-8 border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-bold text-[#003366] uppercase tracking-tight">Owner Dashboard</h1>
                <p className="text-gray-500 mt-1">Financial & Project Overview</p>
            </div>

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
