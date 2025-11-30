import { getCrewStats } from "@/app/actions/dashboard";
import Link from "next/link";

export default async function CrewDashboard() {
    const stats = await getCrewStats();

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Crew Command</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Overview & Actions</p>
                </div>
                <div className="px-4 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-bold border border-green-200 flex items-center shadow-sm">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></span>
                    ONLINE
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-blue-600 hover:shadow-md transition-shadow">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Current Assignment</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                        {stats.currentAssignment?.name || "No active assignment"}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 font-medium">
                        {stats.currentAssignment?.description || "Check with superintendent"}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-yellow-500 hover:shadow-md transition-shadow">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Today's Production</h3>
                    <p className="text-4xl font-extrabold text-gray-900 dark:text-white mt-2">
                        {stats.todayProduction} <span className="text-lg text-gray-500 font-bold">LF</span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/dashboard/reports" className="group bg-blue-600 hover:bg-blue-700 text-white p-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center text-center border-b-4 border-blue-800">
                    <span className="text-xl font-bold tracking-tight">New Daily Report</span>
                    <span className="text-sm text-blue-100 mt-1 font-medium">Log hours, production, and notes</span>
                </Link>

                <Link href="/dashboard/rod-pass" className="group bg-yellow-500 hover:bg-yellow-600 text-white p-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center text-center border-b-4 border-yellow-700">
                    <span className="text-xl font-bold tracking-tight text-black/80">Log Rod Pass</span>
                    <span className="text-sm text-black/60 mt-1 font-medium">Record drill rod data</span>
                </Link>
            </div>
        </div>
    );
}
