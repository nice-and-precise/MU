'use server';

import { revalidatePath } from 'next/cache';
import { authenticatedAction } from '@/lib/safe-action';
import { z } from 'zod';
import { InvoicingService } from '@/services/invoicing';
import {
    CreateInvoiceSchema,
    UpdateInvoiceSchema,
    FinalizeInvoiceSchema
} from '@/schemas/invoicing';

export const createInvoice = authenticatedAction(
    CreateInvoiceSchema,
    async ({ projectId }, userId) => {
        const invoice = await InvoicingService.createInvoice(projectId, userId);
        revalidatePath(`/dashboard/projects/${projectId}`);
        return invoice;
    }
);

export const getInvoices = authenticatedAction(
    z.string(), // projectId
    async (projectId) => {
        return await InvoicingService.getInvoices(projectId);
    }
);

export const getInvoice = authenticatedAction(
    z.string(), // id
    async (id) => {
        return await InvoicingService.getInvoice(id);
    }
);

export const updateInvoice = authenticatedAction(
    UpdateInvoiceSchema,
    async ({ id, data }) => {
        await InvoicingService.updateInvoice(id, data);
        revalidatePath(`/dashboard/invoices/${id}`);
        return { success: true };
    }
);

export const finalizeInvoice = authenticatedAction(
    FinalizeInvoiceSchema,
    async ({ id }) => {
        await InvoicingService.finalizeInvoice(id);
        revalidatePath(`/dashboard/invoices/${id}`);
        return { success: true };
    }
);
