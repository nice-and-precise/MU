export default function SettingsPage() {
    return (
        <div className="p-8 max-w-4xl">
            <div className="mb-8 border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-bold text-[#003366] uppercase tracking-tight">System Settings</h1>
                <p className="text-gray-500 mt-1">Configuration and Preferences</p>
            </div>

            <div className="space-y-6">
                {/* Profile Section */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <span className="w-1 h-6 bg-yellow-500 mr-3 rounded-sm"></span>
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

                <div className="flex justify-end">
                    <button className="px-6 py-3 bg-[#003366] text-white font-bold rounded hover:bg-[#002244] transition-colors shadow-sm">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
