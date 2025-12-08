'use server';

import { authenticatedAction } from '@/lib/safe-action';
import { PayrollService } from '@/services/payroll';
import { PayrollReportSchema } from '@/schemas/payroll';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const getPayrollReport = authenticatedAction(
    PayrollReportSchema,
    async ({ dateRange }) => {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "OWNER") {
            throw new Error("Unauthorized: Only Owners can view payroll reports.");
        }
        return await PayrollService.getPayrollSummary(dateRange.from, dateRange.to);
    }
);
