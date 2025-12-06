'use server';

import { authenticatedAction } from '@/lib/safe-action';
import { ImportService } from '@/services/import';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { extractDataFromText } from "@/lib/extraction/pipeline";
const pdf = require("pdf-parse");

export const importSurveyData = authenticatedAction(
    z.instanceof(FormData),
    async (formData, userId) => {
        const file = formData.get('file') as File;
        const projectId = formData.get('projectId') as string;

        if (!file || !projectId) {
            throw new Error('Missing file or project ID');
        }

        const buffer = await file.arrayBuffer();
        const content = new TextDecoder().decode(buffer);

        const result = await ImportService.processSurveyFile(projectId, file.name, content, userId);

        revalidatePath(`/dashboard/projects/${projectId}`);
        return { count: result.count };
    }
);

export const extractEstimateData = authenticatedAction(
    z.instanceof(FormData),
    async (formData, userId) => {
        const file = formData.get('file') as File;
        if (!file) throw new Error("No file provided");

        const buffer = Buffer.from(await file.arrayBuffer());
        let text = "";

        if (file.type === "application/pdf") {
            const data = await pdf(buffer);
            text = data.text;
        } else {
            text = buffer.toString('utf-8');
        }

        const extractedItems = await extractDataFromText(text);
        return extractedItems;
    }
);
