import { z } from 'zod';

// --- Sub-Schemas for Arrays ---

export const CrewMemberSchema = z.object({
    employeeId: z.string().min(1, "Select an employee"),
    hours: z.coerce.number().min(0, "Enter hours"),
    role: z.string().min(1, "Select a role"),
});

export const ProductionLogSchema = z.object({
    activity: z.string().min(1, "Select activity"),
    lf: z.coerce.number().min(0, "Enter footage"),
    pitch: z.coerce.number().optional(),
    azimuth: z.coerce.number().optional(),
});

export const MaterialUsageSchema = z.object({
    inventoryItemId: z.string().min(1, "Select item"),
    quantity: z.coerce.number().min(0, "Enter quantity"),
});

export const EquipmentUsageSchema = z.object({
    assetId: z.string().min(1, "Select asset"),
    hours: z.coerce.number().min(0, "Enter hours"),
});

// --- Main Schemas ---

export const CreateDailyReportSchema = z.object({
    projectId: z.string().min(1, "Project ID is required"),
    reportDate: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid date"),
    notes: z.string().optional(),
});

// For the form updates, we will use defined objects instead of JSON strings
// The server action will need to handle the serialization if keeping the DB as JSON-string fields
// OR we update the type to expect objects if we change the action signature.
// For now, let's keep the Action expecting what the Service expects, but the Form uses these schemas.

export const UpdateDailyReportSchema = z.object({
    crew: z.array(CrewMemberSchema).optional(),
    production: z.array(ProductionLogSchema).optional(),
    materials: z.array(MaterialUsageSchema).optional(),
    equipment: z.array(EquipmentUsageSchema).optional(),
    weather: z.string().optional(),
    notes: z.string().optional(),
});

export type CreateDailyReportInput = z.infer<typeof CreateDailyReportSchema>;
export type UpdateDailyReportInput = z.infer<typeof UpdateDailyReportSchema>;

export type CrewMember = z.infer<typeof CrewMemberSchema>;
export type ProductionLog = z.infer<typeof ProductionLogSchema>;
export type MaterialUsage = z.infer<typeof MaterialUsageSchema>;
export type EquipmentUsage = z.infer<typeof EquipmentUsageSchema>;
