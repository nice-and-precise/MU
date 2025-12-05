'use server'

import { authenticatedActionNoInput } from "@/lib/safe-action";
import { getActiveProjectsService } from "@/services/projects";

export const getActiveProjects = authenticatedActionNoInput(async () => {
    return await getActiveProjectsService();
});
