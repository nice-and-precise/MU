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

            let totalRegularMinutes = 0;
            let totalOvertimeMinutes = 0;
            const weeklyRegularMinutes = new Map<string, number>();

            // Sort entries chronologically
            employeeEntries.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

            // 1. Group by Day for Daily OT Calculation
            const entriesByDay = new Map<string, typeof employeeEntries>();
            employeeEntries.forEach(entry => {
                const dayKey = startOfDay(entry.startTime).toISOString();
                if (!entriesByDay.has(dayKey)) {
                    entriesByDay.set(dayKey, []);
                }
                entriesByDay.get(dayKey)?.push(entry);
            });

            // 2. Calculate Daily Hours
            for (const [dayKey, dayEntries] of entriesByDay) {
                let dailyMinutes = 0;
                dayEntries.forEach(entry => {
                    if (!entry.endTime) return;
                    dailyMinutes += differenceInMinutes(entry.endTime, entry.startTime);
                });

                let dailyRegular = 0;
                let dailyOT = 0;

                // Check Overtime Rule
                if (employee.overtimeRule === 'OVER_8_DAY' || employee.overtimeRule === 'UNION_X') {
                    if (dailyMinutes > 480) { // 8 hours
                        dailyRegular = 480;
                        dailyOT = dailyMinutes - 480;
                    } else {
                        dailyRegular = dailyMinutes;
                    }
                } else {
                    // Default / OVER_40_WEEK only: All goes to regular bucket initially
                    dailyRegular = dailyMinutes;
                }

                // Add to totals
                totalOvertimeMinutes += dailyOT;

                // Track weekly regular for 40h rule
                // Note: The dayKey is ISO string, we need week key
                const weekKey = startOfWeek(new Date(dayKey)).toISOString();
                const currentWeekRegular = weeklyRegularMinutes.get(weekKey) || 0;
                weeklyRegularMinutes.set(weekKey, currentWeekRegular + dailyRegular);
            }

            // 3. Apply Weekly 40h Cap to Regular Hours
            for (const [_, weekMinutes] of weeklyRegularMinutes) {
                if (weekMinutes > 2400) { // 40 hours
                    totalRegularMinutes += 2400;
                    totalOvertimeMinutes += (weekMinutes - 2400);
                } else {
                    totalRegularMinutes += weekMinutes;
                }
            }

            summary.push({
                employeeId,
                employeeName,
                regularHours: parseFloat((totalRegularMinutes / 60).toFixed(2)),
                overtimeHours: parseFloat((totalOvertimeMinutes / 60).toFixed(2)),
                doubleTimeHours: 0,
                totalHours: parseFloat(((totalRegularMinutes + totalOvertimeMinutes) / 60).toFixed(2)),
                qboEmployeeId: employee.qboEmployeeId,
                defaultEarningCode: employee.defaultEarningCode,
                defaultDept: employee.defaultDept,
                regPayCode: employee.defaultEarningCode || 'Regular',
                otPayCode: 'Overtime',
            });
        }

        return summary.sort((a, b) => a.employeeName.localeCompare(b.employeeName));
    }
}
