import { EmployeeManager } from "@/components/financials/EmployeeManager";
import { getEmployees } from "@/actions/employees";

export default async function SettingsPage() {
    const { data } = await getEmployees();
    const employees = data || [];

    return (
        <div className="p-8 max-w-4xl">
            <div className="mb-8 border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">System Settings</h1>
                <p className="text-gray-500 mt-1">Configuration and Preferences</p>
            </div>

            <div className="space-y-6">
                {/* Profile Section */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <span className="w-1 h-6 bg-[#003366] mr-3 rounded-sm"></span>
                        Profile Settings
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                            <input type="text" className="w-full p-2 border border-gray-300 rounded focus:border-[#003366] focus:ring-0" defaultValue="Owner User" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                            <input type="email" className="w-full p-2 border border-gray-300 rounded focus:border-[#003366] focus:ring-0" defaultValue="owner@midwestunderground.com" disabled />
                        </div>
                    </div>
                </div>

                {/* Application Settings */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <span className="w-1 h-6 bg-[#003366] mr-3 rounded-sm"></span>
                        Application Preferences
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                            <div>
                                <h3 className="font-bold text-gray-900">Dark Mode</h3>
                                <p className="text-sm text-gray-500">Toggle system-wide dark theme</p>
                            </div>
                            <button className="px-4 py-2 bg-gray-200 text-gray-600 rounded font-medium text-sm">System Default</button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                            <div>
                                <h3 className="font-bold text-gray-900">Notifications</h3>
                                <p className="text-sm text-gray-500">Email alerts for daily reports</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-bold text-[#003366]">ENABLED</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Roles & Permissions */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <span className="w-1 h-6 bg-[#003366] mr-3 rounded-sm"></span>
                        User Roles & Permissions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <h3 className="font-bold text-gray-900">Admin / Owner</h3>
                            <p className="text-xs text-gray-500 mt-1">Full access to all settings, financials, and personnel.</p>
                            <div className="mt-3 flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">JD</div>
                            </div>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <h3 className="font-bold text-gray-900">Foreman</h3>
                            <p className="text-xs text-gray-500 mt-1">Can create reports, view assigned projects, and manage crew.</p>
                            <div className="mt-3 flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">BS</div>
                                <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">MK</div>
                            </div>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <h3 className="font-bold text-gray-900">Crew Member</h3>
                            <p className="text-xs text-gray-500 mt-1">View-only access to assigned jobs and safety docs.</p>
                            <div className="mt-3 flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">+5</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Integrations */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <span className="w-1 h-6 bg-[#003366] mr-3 rounded-sm"></span>
                        Integrations
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-700 font-bold text-xl">QB</div>
                                <div>
                                    <h3 className="font-bold text-gray-900">QuickBooks Online</h3>
                                    <p className="text-sm text-gray-500">Sync invoices, payroll, and expenses.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">CONNECTED</span>
                                <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50">
                                    Configure
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-16">
                            <label className="flex items-center space-x-2 text-sm text-gray-700">
                                <input type="checkbox" defaultChecked className="rounded text-[#003366] focus:ring-[#003366]" />
                                <span>Sync Invoices</span>
                            </label>
                            <label className="flex items-center space-x-2 text-sm text-gray-700">
                                <input type="checkbox" defaultChecked className="rounded text-[#003366] focus:ring-[#003366]" />
                                <span>Sync Payroll</span>
                            </label>
                            <label className="flex items-center space-x-2 text-sm text-gray-700">
                                <input type="checkbox" className="rounded text-[#003366] focus:ring-[#003366]" />
                                <span>Sync Expenses</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Employee Management */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center">
                            <span className="w-1 h-6 bg-[#003366] mr-3 rounded-sm"></span>
                            Employee Management
                        </h2>
                        <a href="/dashboard/labor" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                            Manage All Employees &rarr;
                        </a>
                    </div>
                    <p className="text-gray-500 mb-4">Manage your workforce, assign roles, and track certifications.</p>
                    <EmployeeManager initialEmployees={employees || []} />
                </div>

                <div className="flex justify-end">
                    <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition-colors shadow-sm">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
