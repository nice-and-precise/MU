import { z } from 'zod';

export const GeotechReportSchema = z.object({
    projectId: z.string(),
    title: z.string().min(1, "Title is required"),
    reportDate: z.coerce.date(), // Use coerce.date() to handle string->Date
    engineer: z.string().optional(),
    description: z.string().optional(),
    pdfUrl: z.string().optional(),
});

export const SoilLayerSchema = z.object({
    geotechReportId: z.string(),
    startDepth: z.number().or(z.string().transform(Number)),
    endDepth: z.number().or(z.string().transform(Number)),
    soilType: z.string(),
    description: z.string().optional(),
    color: z.string().optional(),
    hardness: z.number().or(z.string().transform(Number)).optional(),
    phpaRequired: z.boolean().optional(),
    rockStrengthPsi: z.number().or(z.string().transform(Number)).optional(),
});

export const ImportFromMNKWISchema = z.object({
    projectId: z.string(),
    lat: z.number(),
    lon: z.number()
});
