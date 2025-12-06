'use server';

import { authenticatedAction } from '@/lib/safe-action';
import { PayrollService } from '@/services/payroll';
import { PayrollReportSchema } from '@/schemas/payroll';

export const getPayrollReport = authenticatedAction(
    PayrollReportSchema,
    async ({ dateRange }) => {
        return await PayrollService.getPayrollSummary(dateRange.from, dateRange.to);
    }
);
