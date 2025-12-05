import { getShifts } from "@/actions/schedule";
import { getCrews } from "@/actions/crews";
import { getEmployees } from "@/actions/employees";
import { prisma } from "@/lib/prisma"; // Direct prisma for projects for now
import { ScheduleBoard } from "@/components/schedule/ScheduleBoard";
import { startOfWeek, endOfWeek, addWeeks } from "date-fns";

export default async function DispatchPage() {
    // Default to current week
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(addWeeks(new Date(), 2), { weekStartsOn: 1 }); // Fetch 2 weeks buffer

    const [shiftsRes, crewsRes, employeesRes, projects] = await Promise.all([
        getShifts({ start, end }),
        getCrews(),
        getEmployees(),
        prisma.project.findMany({ where: { status: { not: 'COMPLETED' } }, orderBy: { name: 'asc' } })
    ]);

    const shifts = shiftsRes.success && shiftsRes.data ? shiftsRes.data : [];
    const crews = crewsRes.success && crewsRes.data ? crewsRes.data : [];
    const employees = employeesRes.success && employeesRes.data ? employeesRes.data : [];

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dispatch & Scheduling</h1>
                <p className="text-gray-500">Manage crew assignments and project schedules.</p>
            </div>

            <ScheduleBoard
                shifts={shifts}
                crews={crews}
                employees={employees}
                projects={projects}
            />
        </div>
    );
}
