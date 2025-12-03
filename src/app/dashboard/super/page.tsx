import { getSuperStats } from "@/app/actions/dashboard";
import { CrewDispatch } from "@/components/financials/CrewDispatch";
import { getAvailableCrewMembers } from "@/actions/employees";
import { getAssets } from "@/actions/assets";
import { getActiveProjects } from "@/actions/projects";

export default async function SuperDashboard() {
    const stats = await getSuperStats();
    const { data: employees } = await getAvailableCrewMembers();
    const { data: assets } = await getAssets();
    const { data: projects } = await getActiveProjects();

    return (
        <div className="p-8">
            <div className="mb-8 border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-bold text-[#003366] uppercase tracking-tight">Superintendent Dashboard</h1>
                <p className="text-gray-500 mt-1">Field Operations & Oversight</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border-t-4 border-[#003366] shadow-sm border-x border-b border-gray-200">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">My Projects</h3>
                    <p className="text-4xl font-extrabold text-gray-900 mt-2">{stats.myProjects}</p>
                </div>
                <div className="bg-white p-6 rounded-lg border-t-4 border-blue-500 shadow-sm border-x border-b border-gray-200">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Open Inspections</h3>
                    <p className="text-4xl font-extrabold text-blue-600 mt-2">{stats.openInspections}</p>
                </div>
                <div className="bg-white p-6 rounded-lg border-t-4 border-purple-600 shadow-sm border-x border-b border-gray-200">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Daily Reports (Today)</h3>
                    <p className="text-4xl font-extrabold text-purple-700 mt-2">{stats.dailyReportsToday}</p>
                </div>
            </div>

            <div className="mt-8">
                <CrewDispatch
                    employees={employees || []}
                    assets={assets || []}
                    projects={projects || []}
                />
            </div>
        </div>
    );
}
