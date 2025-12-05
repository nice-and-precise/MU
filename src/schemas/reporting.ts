import { z } from 'zod';

export const GenerateAsBuiltSchema = z.object({
    boreId: z.string().min(1, "Bore ID is required"),
});

export type GenerateAsBuiltInput = z.infer<typeof GenerateAsBuiltSchema>;
