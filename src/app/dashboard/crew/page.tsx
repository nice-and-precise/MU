import { getCrewStats } from "@/app/actions/dashboard";

export default async function CrewDashboard() {
    const stats = await getCrewStats();

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Crew Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-gray-500 text-sm font-medium">Current Assignment</h3>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-2">
                        {stats.currentAssignment?.name || "No active assignment"}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                        {stats.currentAssignment?.description || "Check with superintendent"}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-gray-500 text-sm font-medium">Today's Production</h3>
                    <p className="text-3xl font-bold text-green-500 mt-2">{stats.todayProduction} LF</p>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <button className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-xl shadow-sm transition-colors flex flex-col items-center justify-center space-y-2">
                    <span className="text-lg font-semibold">New Daily Report</span>
                    <span className="text-sm opacity-80">Log hours, production, and notes</span>
                </button>
                <button className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-xl shadow-sm transition-colors flex flex-col items-center justify-center space-y-2">
                    <span className="text-lg font-semibold">Log Rod Pass</span>
                    <span className="text-sm opacity-80">Record drill rod data</span>
                </button>
            </div>
        </div>
    );
}
