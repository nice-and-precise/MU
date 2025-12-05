import { getEmployees } from "@/actions/employees";
import EmployeeDirectory from "@/components/labor/EmployeeDirectory";

export default async function LaborPage() {
    const res = await getEmployees();
    const data = res.success ? res.data : [];
    const employees = data || [];

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Labor Management</h1>
                <p className="text-gray-500">Manage employees, crews, and rates.</p>
            </div>

            <EmployeeDirectory employees={employees} />
        </div>
    );
}
