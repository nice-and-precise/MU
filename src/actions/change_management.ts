'use server';

import { revalidatePath } from 'next/cache';
import { authenticatedAction } from '@/lib/safe-action';
import { z } from 'zod';
import { ChangeManagementService } from '@/services/change_management';
import {
    CreateTMTicketSchema,
    CreateChangeOrderSchema,
    ApproveChangeOrderSchema
} from '@/schemas/change_management';

// --- T&M Tickets ---

export const createTMTicket = authenticatedAction(
    CreateTMTicketSchema,
    async (data, userId) => {
        const ticket = await ChangeManagementService.createTMTicket({ ...data, userId });
        revalidatePath(`/dashboard/projects/${data.projectId}`);
        return ticket;
    }
);

export const getTMTickets = authenticatedAction(
    z.string(), // projectId
    async (projectId) => {
        return await ChangeManagementService.getTMTickets(projectId);
    }
);

// --- Change Orders ---

export const createChangeOrder = authenticatedAction(
    CreateChangeOrderSchema,
    async (data, userId) => {
        const co = await ChangeManagementService.createChangeOrder({ ...data, userId });
        revalidatePath(`/dashboard/projects/${data.projectId}`);
        return co;
    }
);

export const getChangeOrders = authenticatedAction(
    z.string(), // projectId
    async (projectId) => {
        return await ChangeManagementService.getChangeOrders(projectId);
    }
);

export const approveChangeOrder = authenticatedAction(
    ApproveChangeOrderSchema,
    async ({ id }, userId) => {
        await ChangeManagementService.approveChangeOrder(id, userId);
        revalidatePath(`/dashboard/projects`);
        return { success: true };
    }
);
