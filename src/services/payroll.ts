import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, differenceInMinutes, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays } from 'date-fns';

interface PayrollEntry {
    employeeId: string;
    employeeName: string;
    regularHours: number;
    overtimeHours: number;
    doubleTimeHours: number; // Placeholder for future use or specific rules
    totalHours: number;
}

export class PayrollService {
    static async getPayrollSummary(startDate: Date, endDate: Date): Promise<PayrollEntry[]> {
        // 1. Fetch all time entries in the range
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

        // 2. Group by employee
        const entriesByEmployee = new Map<string, typeof entries>();
        entries.forEach(entry => {
            if (!entriesByEmployee.has(entry.employeeId)) {
                entriesByEmployee.set(entry.employeeId, []);
            }
            entriesByEmployee.get(entry.employeeId)?.push(entry);
        });

        const summary: PayrollEntry[] = [];

        // 3. Calculate hours per employee
        for (const [employeeId, employeeEntries] of entriesByEmployee) {
            if (employeeEntries.length === 0) continue;

            const employeeName = `${employeeEntries[0].employee.firstName} ${employeeEntries[0].employee.lastName}`;
            let regularMinutes = 0;
            let overtimeMinutes = 0;

            // Basic weekly overtime calculation logic (Weekly > 40 hours)
            // Note: This is a simplified calculation. Ideally, we should iterate week by week.

            // Sort entries by time
            employeeEntries.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

            // Group entries by week to apply 40h rule correctly
            // Find the first start of week
            const firstEntryDate = employeeEntries[0].startTime;
            // Start of week defaults to Sunday vs Monday depending on locale, usually Sunday in US. 
            // Let's assume Week starts on Sunday for now or use locale.

            // To strictly follow "Weekly Overtime", we need to bucket minutes by week.
            const minutesByWeek = new Map<string, number>();

            employeeEntries.forEach(entry => {
                if (!entry.endTime) return;
                const minutes = differenceInMinutes(entry.endTime, entry.startTime);

                // Identify which week this entry belongs to
                const weekStart = startOfWeek(entry.startTime).toISOString();
                const currentWeekMinutes = minutesByWeek.get(weekStart) || 0;
                minutesByWeek.set(weekStart, currentWeekMinutes + minutes);
            });

            // Sum up Reg/OT
            for (const [_, totalWeeklyMinutes] of minutesByWeek) {
                if (totalWeeklyMinutes > 2400) { // 40 hours * 60 minutes
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
            });
        }

        return summary.sort((a, b) => a.employeeName.localeCompare(b.employeeName));
    }
}
