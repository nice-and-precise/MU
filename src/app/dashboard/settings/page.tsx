import { getEmployees } from "@/actions/employees";
import { getUserPreferences } from "@/actions/user";
import { getAuditLogs } from "@/actions/audit";
import { SettingsView } from "./settings-view";

export default async function SettingsPage() {
    const [empRes, prefRes, auditRes] = await Promise.all([
        getEmployees(),
        getUserPreferences(),
        getAuditLogs({ limit: 50 })
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
        />
    );
}
