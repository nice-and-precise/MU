import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { TimeEntryControls } from "@/components/mobile/TimeEntryControls";
import { TimeService } from "@/services/time";

export default async function TimePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return <div>Please log in.</div>;

    const employee = await prisma.employee.findFirst({
        where: { email: session.user.email }
    });

    if (!employee) return <div>Employee not found</div>;

    // Get current week's time card or entries
    const entries = await prisma.timeEntry.findMany({
        where: {
            employeeId: employee.id,
            startTime: {
                gte: startOfWeek(new Date(), { weekStartsOn: 1 }),
                lte: endOfWeek(new Date(), { weekStartsOn: 1 })
            }
        },
        include: { project: true },
        orderBy: { startTime: 'desc' }
    });

    const totalHours = entries.reduce((acc, entry) => {
        if (entry.endTime) {
            return acc + (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / (1000 * 60 * 60);
        }
        return acc;
    }, 0);

    const weeklyEstPay = await TimeService.getWeeklyEstGrossPay(employee.id);

    // Get active projects
    const projects = await prisma.project.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { name: 'asc' }
    });

    // Get active clock-in status
    const activeEntry = await prisma.timeEntry.findFirst({
        where: {
            employeeId: employee.id,
            endTime: null
        }
    });

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <div className="bg-[#003366] text-white p-4 sticky top-0 z-10 shadow-md">
                <div>
                    <h1 className="text-lg font-bold">Time Sheet</h1>
                    <div className="flex justify-between items-end">
                        <p className="text-xs text-blue-200">This Week: {totalHours.toFixed(2)} hrs</p>
                        <p className="text-sm font-bold text-green-300">Est: ${weeklyEstPay.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-6">
                <TimeEntryControls
                    employeeId={employee.id}
                    activeEntry={activeEntry}
                    projects={projects}
                    weeklyEstimatedGrossPay={weeklyEstPay}
                />

                <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">Recent Activity</h3>
                    {entries.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 bg-white rounded-lg border border-dashed">
                            No entries for this week.
                        </div>
                    ) : (
                        entries.map(entry => (
                            <div key={entry.id} className="bg-white p-3 rounded-lg border shadow-sm flex justify-between items-center">
                                <div>
                                    <div className="font-semibold text-gray-800">{entry.project?.name || "General"}</div>
                                    <div className="text-xs text-gray-500">
                                        {format(new Date(entry.startTime), "EEE, MMM d")} • {format(new Date(entry.startTime), "h:mm a")} - {entry.endTime ? format(new Date(entry.endTime), "h:mm a") : "Active"}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-gray-900">
                                        {entry.endTime ?
                                            ((new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / (1000 * 60 * 60)).toFixed(2)
                                            : "..."}
                                    </div>
                                    <div className="text-[10px] uppercase text-gray-400 font-medium">Hrs</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
