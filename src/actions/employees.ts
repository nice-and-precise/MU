'use server';

import { authenticatedAction, authenticatedActionNoInput } from '@/lib/safe-action';
import { EmployeeService } from '@/services/employees';
import { CreateEmployeeSchema, UpdateEmployeeSchema } from '@/schemas/employees';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const getEmployees = authenticatedActionNoInput(
    async () => {
        const session = await getServerSession(authOptions);
        const isOwner = session?.user?.role === "OWNER";
        const employees = await EmployeeService.getEmployees();

        if (isOwner) {
            return employees;
        }

        // Strip sensitive data for non-owners
        return employees.map(emp => ({
            ...emp,
            hourlyRate: null,
            burdenRate: null,
            salary: null,
            ssn: null,
            defaultEarningCode: null,
            qboEmployeeId: null,
            adpEmployeeId: null,
            doubleTimeMultiplier: null,
            defaultOvertimeMultiplier: null,
            doubleTimeDailyThreshold: null
        }));
    }
);

export const getEmployee = authenticatedAction(
    z.string(),
    async (id) => {
        return await EmployeeService.getEmployee(id);
    }
);

export const createEmployee = authenticatedAction(
    CreateEmployeeSchema,
    async (data, userId) => {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "OWNER") {
            throw new Error("Unauthorized: Only Owners can create employees.");
        }
        const employee = await EmployeeService.createEmployee(data);
        revalidatePath('/dashboard/labor');
        return employee;
    }
);

export const updateEmployee = authenticatedAction(
    z.object({
        id: z.string(),
        data: UpdateEmployeeSchema
    }),
    async ({ id, data }) => {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "OWNER") {
            throw new Error("Unauthorized: Only Owners can update employees.");
        }
        const employee = await EmployeeService.updateEmployee(id, data);
        revalidatePath('/dashboard/labor');
        revalidatePath(`/dashboard/labor/${id}`);
        return employee;
    }
);

export const deleteEmployee = authenticatedAction(
    z.string(),
    async (id) => {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "OWNER") {
            throw new Error("Unauthorized: Only Owners can delete employees.");
        }
        await EmployeeService.deleteEmployee(id);
        revalidatePath('/dashboard/labor');
        return { success: true };
    }
);

export const getAvailableCrewMembers = authenticatedActionNoInput(
    async () => {
        return await EmployeeService.getAvailableCrewMembers();
    }
);

export const getEmployeeUsage = authenticatedAction(
    z.string(),
    async (id) => {
        return await EmployeeService.getEmployeeUsage(id);
    }
);

export const getEmployeeTimeEntries = authenticatedAction(
    z.string(),
    async (id) => {
        return await EmployeeService.getEmployeeTimeEntries(id);
    }
);

export const createSystemUser = authenticatedAction(
    z.object({
        employeeId: z.string(),
        email: z.string().email(),
        role: z.string()
    }),
    async ({ employeeId, email, role }) => {
        const user = await EmployeeService.createSystemUser(employeeId, email, role);
        revalidatePath('/dashboard/labor');
        return user;
    }
);

export const signDocument = authenticatedAction(
    z.string(),
    async (id) => {
        await EmployeeService.signDocument(id);
        revalidatePath('/mobile/profile');
        return { success: true };
    }
);
