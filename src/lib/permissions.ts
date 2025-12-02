
export type UserRole = "Owner" | "Foreman" | "Operator" | "Laborer";

export const PERMISSIONS = {
    Owner: {
        canManageCrew: true,
        canAssignAssets: true,
        canEditDocs: true,
        canViewFinancials: true,
        canEditTime: true,
    },
    Foreman: {
        canManageCrew: true,
        canAssignAssets: false, // Only Owner assigns assets to project, Foreman manages on-site? Let's say false for now.
        canEditDocs: false,
        canViewFinancials: false,
        canEditTime: true, // Can edit crew time
    },
    Operator: {
        canManageCrew: false,
        canAssignAssets: false,
        canEditDocs: false,
        canViewFinancials: false,
        canEditTime: false,
    },
    Laborer: {
        canManageCrew: false,
        canAssignAssets: false,
        canEditDocs: false,
        canViewFinancials: false,
        canEditTime: false,
    },
};

export function hasPermission(role: UserRole, permission: keyof typeof PERMISSIONS["Owner"]) {
    return PERMISSIONS[role]?.[permission] || false;
}
