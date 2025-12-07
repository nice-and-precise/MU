export const STATUS_COLORS = {
    DRAFT: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    APPROVED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    ACTIVE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    CLOSED: "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    BLOCKED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    SENT: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400", // For Estimates
    WON: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", // For Estimates
    LOST: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300", // For Estimates
    // Asset Statuses
    AVAILABLE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    IN_USE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    MAINTENANCE: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    RETIRED: "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    ON_SITE: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    DRILLING: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    // Priorities
    LOW: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    HIGH: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    // Roles
    FOREMAN: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    OPERATOR: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    LABORER: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    "TRUCK DRIVER": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
} as const;

export type StatusType = keyof typeof STATUS_COLORS;

export function getStatusColor(status: string): string {
    const upperStatus = status?.toUpperCase();
    return STATUS_COLORS[upperStatus as StatusType] || "bg-gray-100 text-gray-700";
}
