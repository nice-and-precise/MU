import { getOwnerStats } from "@/app/actions/dashboard";

export default async function OwnerDashboard() {
    const stats = await getOwnerStats();

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Owner Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-gray-500 text-sm font-medium">Active Projects</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.activeProjects}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-gray-500 text-sm font-medium">Total Revenue (Est)</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                        ${stats.totalRevenue.toLocaleString()}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-gray-500 text-sm font-medium">Pending Approvals</h3>
                    <p className="text-3xl font-bold text-orange-500 mt-2">{stats.pendingApprovals}</p>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Recent Activity</h2>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <p className="text-gray-500">No recent activity to display.</p>
                </div>
            </div>
        </div>
    );
}
