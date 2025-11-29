import { getSuperStats } from "@/app/actions/dashboard";

export default async function SuperDashboard() {
    const stats = await getSuperStats();

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Superintendent Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-gray-500 text-sm font-medium">My Projects</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.myProjects}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-gray-500 text-sm font-medium">Open Inspections</h3>
                    <p className="text-3xl font-bold text-blue-500 mt-2">{stats.openInspections}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-gray-500 text-sm font-medium">Daily Reports (Today)</h3>
                    <p className="text-3xl font-bold text-purple-500 mt-2">{stats.dailyReportsToday}</p>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Active Crews</h2>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <p className="text-gray-500">Crew locations and status will appear here.</p>
                </div>
            </div>
        </div>
    );
}
