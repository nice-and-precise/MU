import { z } from 'zod';

export const CreateEmployeeSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email().optional().or(z.literal("")).or(z.null()),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    ssn: z.string().optional().nullable(),
    dob: z.union([z.string(), z.date(), z.null()]).optional().transform(val => val ? new Date(val) : undefined),
    emergencyContact: z.string().optional().nullable(),
    photoUrl: z.string().optional().nullable(),
    role: z.string().min(1, "Role is required"),
    position: z.string().optional().nullable(),
    status: z.enum(['ACTIVE', 'TERMINATED', 'LEAVE']).default('ACTIVE'),
    hireDate: z.union([z.string(), z.date(), z.null()]).optional().transform(val => val ? new Date(val) : undefined),
    terminationDate: z.union([z.string(), z.date(), z.null()]).optional().transform(val => val ? new Date(val) : undefined),

    // Payroll
    payType: z.enum(['HOURLY', 'SALARY']).default('HOURLY'),
    paySchedule: z.enum(['WEEKLY', 'BIWEEKLY', 'SEMIMONTHLY', 'MONTHLY']).default('WEEKLY'),
    hourlyRate: z.number().min(0).default(0),
    burdenRate: z.number().min(0).default(0),
    salary: z.number().optional().nullable(),
    overtimeRule: z.string().optional().nullable(),
    defaultOvertimeMultiplier: z.number().default(1.5),
    doubleTimeMultiplier: z.number().default(2.0),

    taxStatus: z.string().optional().nullable(),
    primaryState: z.string().optional().nullable(),
    primaryWorkState: z.string().optional().nullable(),
    is1099: z.boolean().default(false),

    defaultPayrollItems: z.string().default("[]"),
    qboEmployeeId: z.string().optional().nullable(),
    defaultEarningCode: z.string().optional().nullable(),
    adpEmployeeId: z.string().optional().nullable(),

    userId: z.string().optional().nullable(), // Link to existing user
});

export const UpdateEmployeeSchema = CreateEmployeeSchema.partial().extend({
    id: z.string().optional(), // ID might be passed in data or separate arg
});

export type CreateEmployeeInput = z.infer<typeof CreateEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof UpdateEmployeeSchema>;
