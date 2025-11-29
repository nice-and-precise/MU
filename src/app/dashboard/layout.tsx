import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, User, LayoutDashboard, HardHat, FileText, Settings } from "lucide-react";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 text-white hidden md:flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold text-blue-400">Midwest Underground</h1>
                    <p className="text-xs text-gray-400 mt-1">Operations Platform</p>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
                        <LayoutDashboard className="h-5 w-5" />
                        <span>Dashboard</span>
                    </Link>

                    <Link href="/dashboard/projects" className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
                        <HardHat className="h-5 w-5" />
                        <span>Projects</span>
                    </Link>

                    <Link href="/dashboard/reports" className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
                        <FileText className="h-5 w-5" />
                        <span>Daily Reports</span>
                    </Link>

                    {session.user.role === "OWNER" && (
                        <Link href="/dashboard/settings" className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
                            <Settings className="h-5 w-5" />
                            <span>Settings</span>
                        </Link>
                    )}
                </nav>

                <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center space-x-3 px-4 py-2">
                        <div className="bg-blue-600 rounded-full p-2">
                            <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{session.user.name}</p>
                            <p className="text-xs text-gray-400 truncate">{session.user.role}</p>
                        </div>
                    </div>
                    <Link href="/api/auth/signout" className="flex items-center space-x-3 px-4 py-2 mt-2 text-red-400 hover:text-red-300 text-sm">
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
