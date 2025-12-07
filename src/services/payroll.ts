import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, differenceInMinutes, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays } from 'date-fns';

interface PayrollEntry {
    employeeId: string;
    employeeName: string;
    regularHours: number;
    overtimeHours: number;
    doubleTimeHours: number;
    totalHours: number;
    // QBO Fields
    qboEmployeeId?: string | null;
    defaultEarningCode?: string | null;
    defaultDept?: string | null;
    regPayCode?: string;
    otPayCode?: string;
}

export class PayrollService {
    static async getPayrollSummary(startDate: Date, endDate: Date): Promise<PayrollEntry[]> {
        const entries = await prisma.timeEntry.findMany({
            where: {
                startTime: {
                    gte: startOfDay(startDate),
                },
                endTime: {
                    lte: endOfDay(endDate),
                },
            },
            include: {
                employee: true,
            },
        });

        const entriesByEmployee = new Map<string, typeof entries>();
        entries.forEach(entry => {
            if (!entriesByEmployee.has(entry.employeeId)) {
                entriesByEmployee.set(entry.employeeId, []);
            }
            entriesByEmployee.get(entry.employeeId)?.push(entry);
        });

        const summary: PayrollEntry[] = [];

        for (const [employeeId, employeeEntries] of entriesByEmployee) {
            if (employeeEntries.length === 0) continue;

            const employee = employeeEntries[0].employee;
            const employeeName = `${employee.firstName} ${employee.lastName}`;
            let regularMinutes = 0;
            let overtimeMinutes = 0;

            employeeEntries.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

            const minutesByWeek = new Map<string, number>();

            employeeEntries.forEach(entry => {
                if (!entry.endTime) return;
                const minutes = differenceInMinutes(entry.endTime, entry.startTime);
                const weekStart = startOfWeek(entry.startTime).toISOString();
                const currentWeekMinutes = minutesByWeek.get(weekStart) || 0;
                minutesByWeek.set(weekStart, currentWeekMinutes + minutes);
            });

            for (const [_, totalWeeklyMinutes] of minutesByWeek) {
                if (totalWeeklyMinutes > 2400) { // 40 hours
                    regularMinutes += 2400;
                    overtimeMinutes += (totalWeeklyMinutes - 2400);
                } else {
                    regularMinutes += totalWeeklyMinutes;
                }
            }

            summary.push({
                employeeId,
                employeeName,
                regularHours: parseFloat((regularMinutes / 60).toFixed(2)),
                overtimeHours: parseFloat((overtimeMinutes / 60).toFixed(2)),
                doubleTimeHours: 0,
                totalHours: parseFloat(((regularMinutes + overtimeMinutes) / 60).toFixed(2)),
                qboEmployeeId: employee.qboEmployeeId,
                defaultEarningCode: employee.defaultEarningCode,
                defaultDept: employee.defaultDept,
                regPayCode: employee.defaultEarningCode || 'Regular',
                otPayCode: 'Overtime', // Could be configurable in Employee if needed
            });
        }

        return summary.sort((a, b) => a.employeeName.localeCompare(b.employeeName));
    }
}
