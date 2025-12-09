'use server'

import { authenticatedActionNoInput, authenticatedAction } from "@/lib/safe-action";
import { ProjectService } from "@/services/projects";
import { z } from "zod";

export const getActiveProjects = authenticatedActionNoInput(async () => {
    return await ProjectService.getActiveProjects();
});

export const getProjects = authenticatedAction(
    z.object({
        status: z.array(z.string()).optional(),
    }).optional(),
    async (input) => {
        return await ProjectService.getProjects(input?.status);
    }
);

export const getProject = authenticatedAction(
    z.string(),
    async (id) => {
        return await ProjectService.getProject(id);
    }
);

export const getProjectTimeline = authenticatedAction(
    z.string(),
    async (id) => {
        return await ProjectService.getProjectTimeline(id);
    }
);

export const getProjectLaborStats = authenticatedAction(
    z.string(),
    async (id) => {
        return await ProjectService.getLaborStats(id);
    }
);
