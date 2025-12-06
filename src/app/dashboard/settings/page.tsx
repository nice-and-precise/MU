import { getEmployees } from "@/actions/employees";
import { getUserPreferences } from "@/actions/user";
import { SettingsView } from "./settings-view";

export default async function SettingsPage() {
    const [empRes, prefRes] = await Promise.all([
        getEmployees(),
        getUserPreferences()
    ]);

    const data = empRes.success ? empRes.data : [];
    const employees = data || [];

    const preferences = prefRes.success && prefRes.data ? prefRes.data : { notifications: true };

    return (
        <SettingsView initialEmployees={employees} preferences={preferences} />
    );
}
