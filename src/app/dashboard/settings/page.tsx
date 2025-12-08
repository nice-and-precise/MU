import { getEmployees } from "@/actions/employees";
import { getUserPreferences } from "@/actions/user";
import { getAuditLogs } from "@/actions/audit";
import { SettingsView } from "./settings-view";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role || "CREW";
    const isOwner = userRole === "OWNER";

    const [empRes, prefRes, auditRes] = await Promise.all([
        getEmployees(),
        getUserPreferences(),
        isOwner ? getAuditLogs({ limit: 50 }) : Promise.resolve({ success: true, data: [] })
    ]);

    const data = empRes.success ? empRes.data : [];
    const employees = data || [];

    const preferences = prefRes.success && prefRes.data ? prefRes.data : { notifications: true };
    const auditLogs = auditRes.success && auditRes.data ? auditRes.data : [];

    return (
        <SettingsView
            initialEmployees={employees}
            preferences={preferences}
            initialAuditLogs={auditLogs}
            userRole={userRole}
        />
    );
}
