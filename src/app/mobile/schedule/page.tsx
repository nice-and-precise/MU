import { getShifts } from "@/actions/schedule";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { startOfDay, endOfDay } from "date-fns";
import { ShiftCard } from "@/components/mobile/ShiftCard";
import { prisma } from "@/lib/prisma";

export default async function MobileSchedulePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return <div className="p-4">Please log in.</div>;
    }

    // Find current employee
    const employee = await prisma.employee.findFirst({
        where: { email: session.user.email }
    });

    if (!employee) {
        return <div className="p-4">Employee record not found.</div>;
    }

    // Get today's shifts
    const start = startOfDay(new Date());
    const end = endOfDay(new Date());

    const { data: allShifts } = await getShifts(start, end);

    // Filter for this employee (either directly assigned or via crew)
    // Note: getShifts returns all shifts in range. We need to filter here or update getShifts to support filtering.
    // For now, filter in memory.
    const myShifts = (allShifts || []).filter(shift => {
        const isDirectlyAssigned = shift.employeeId === employee.id;
        const isCrewAssigned = shift.crew?.members.some((m: any) => m.employeeId === employee.id);
        return isDirectlyAssigned || isCrewAssigned;
    });

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="bg-[#003366] text-white p-4 sticky top-0 z-10 shadow-md">
                <h1 className="text-lg font-bold">My Schedule</h1>
                <p className="text-xs text-blue-200">{new Date().toLocaleDateString()}</p>
            </div>

            <div className="p-4 space-y-4">
                {myShifts.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <p>No shifts scheduled for today.</p>
                    </div>
                ) : (
                    myShifts.map(shift => (
                        <ShiftCard key={shift.id} shift={shift} />
                    ))
                )}
            </div>
        </div>
    );
}
