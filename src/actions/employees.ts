'use server';

import { authenticatedAction, authenticatedActionNoInput } from '@/lib/safe-action';
import { EmployeeService } from '@/services/employees';
import { CreateEmployeeSchema, UpdateEmployeeSchema } from '@/schemas/employees';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export const getEmployees = authenticatedActionNoInput(
    async () => {
        return await EmployeeService.getEmployees();
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
    async (data) => {
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
        const employee = await EmployeeService.updateEmployee(id, data);
        revalidatePath('/dashboard/labor');
        revalidatePath(`/dashboard/labor/${id}`);
        return employee;
    }
);

export const deleteEmployee = authenticatedAction(
    z.string(),
    async (id) => {
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
