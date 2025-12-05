import { z } from 'zod';

export const ConflictCheckSchema = z.object({
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    crewId: z.string().optional(),
    employeeId: z.string().optional(),
    assetIds: z.array(z.string()).optional(),
    excludeShiftId: z.string().optional(),
});
