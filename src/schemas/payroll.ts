import { z } from 'zod';

export const PayrollReportSchema = z.object({
    dateRange: z.object({
        from: z.date(),
        to: z.date(),
    }),
});

export type PayrollReportInput = z.infer<typeof PayrollReportSchema>;
