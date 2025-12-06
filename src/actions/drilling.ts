'use server';

import { revalidatePath } from 'next/cache';
import { authenticatedAction, authenticatedActionNoInput } from '@/lib/safe-action';
import { DrillingService } from '@/services/drilling';
import { CreateBoreSchema, AddRodPassSchema, GetBoreDetailsSchema } from '@/schemas/drilling';
import { z } from 'zod';

export const createBore = authenticatedAction(
    CreateBoreSchema,
    async (data) => {
        const bore = await DrillingService.createBore(data);
        revalidatePath(`/dashboard/projects/${data.projectId}`);
        return bore;
    }
);

export const getBoreDetails = authenticatedAction(
    GetBoreDetailsSchema,
    async ({ id }) => {
        return await DrillingService.getBoreDetails(id);
    }
);

export const getLastRodPass = authenticatedAction(
    z.string(),
    async (boreId) => {
        return await DrillingService.getLastRodPass(boreId);
    }
);

export const addRodPass = authenticatedAction(
    AddRodPassSchema,
    async (data, userId) => {
        const rodPass = await DrillingService.addRodPass(userId, data);

        // Revalidate relevant paths
        // Convert boreId to project ID for revalidation if needed, or revalidate specific bore page if it exists
        // The service doesn't return project ID directly, but we can assume the caller pages stick to project or dashboard
        // For now, revalidate general dashboard or let client handle specific revalidation
        // We might need to fetch the bore to get projectId for revalidation if we want to be precise, 
        // but the service logic handles logic update.
        // Let's revalidate the bore page if we have a pattern for it.
        // Previous code revalidated `/dashboard/projects/${bore.projectId}`.
        // The service update actually did: revalidatePath(`/dashboard/projects/${bore.projectId}`);
        // BUT wait, `authenticatedAction` runs on server, `DrillingService` runs on server. 
        // `revalidatePath` should ideally be in the Action or the Service? 
        // Ideally in the Action to keep Service pure.
        // But the Service in my previous step didn't return ProjectId? 
        // The service `addRodPass` returns `rodPass`. 
        // To revalidate the project page, I need projectId.
        // I'll fetch it or just revalidate a broader scope if performance isn't critical.
        // OR, I can update the Service to return projectId + rodPass.

        // Let's trust the previous pattern: revalidatePath(`/dashboard/projects/${bore.projectId}`);
        // I should get the projectId. 
        // I'll update the Service to return { rodPass, projectId }.

        // Actually, let's keep it simple for now and revalidate /dashboard/drilling or similar if it exists?
        // Or just revalidatePath('/dashboard/projects/[id]') if I knew the ID.
        // Let's modify the service slightly to return the project ID for revalidation purposes.

        // WAIT. I already wrote the service. I can't easily change it without another tool call.
        // I will verify what `DrillingService.addRodPass` does in `getBoreDetails`? No.
        // `addRodPass` in service returns `rodPass`. 
        // I can fetch the bore again here to get the projectID, or just revalidate broadly.
        // Or, I can skip revalidation here if the client handles it/if I trust the service to have handled it (but I didn't put revalidate in service).
        // Wait, I *did* put revalidatePath in the service?
        // Let me check my write_to_file for `src/services/drilling.ts`.
        // I checked step 295.

        /*
        // Update Bore Status
       if (bore.status === 'PLANNED') {
           await prisma.bore.update({ where: { id: data.boreId }, data: { status: 'IN_PROGRESS' } });
       }

       return rodPass;
        */
        // I did NOT put revalidatePath in the service. Good (separation of concerns).
        // But I need projectId to revalidate the project page.
        // I will do a quick fetch of the bore to get projectId.

        const bore = await DrillingService.getBoreDetails(data.boreId);
        if (bore) {
            revalidatePath(`/dashboard/projects/${bore.projectId}`);
        }

        return rodPass;
    }
);

