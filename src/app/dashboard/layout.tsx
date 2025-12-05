import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, User, Menu } from "lucide-react";
import { NAV_ITEMS } from "@/config/nav";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const userRole = session.user.role;

    const NavContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-700">
                <h1 className="text-xl font-bold text-white tracking-wide">MIDWEST <span className="text-yellow-500">UNDERGROUND</span></h1>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Operations Command</p>
            </div>

            <nav className="flex-1 px-4 space-y-6 mt-6 overflow-y-auto">
                {NAV_ITEMS.map((group, i) => {
                    // Filter groups by role if defined
                    if (group.roles && !group.roles.includes(userRole)) return null;

                    return (
                        <div key={i} className="space-y-1">
                            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{group.title}</p>
                            {group.items.map((item, j) => {
                                // Filter items by role if defined
                                if (item.roles && !item.roles.includes(userRole)) return null;
                                const Icon = item.icon;
                                return (
                                    <Link key={j} href={item.href} className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors">
                                        <Icon className="h-4 w-4" />
                                        <span className="text-sm">{item.title}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-700 mt-auto">
                <div className="flex items-center space-x-3 px-4 py-2">
                    <div className="bg-blue-600 rounded-full p-2">
                        <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-white">{session.user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{session.user.role}</p>
                    </div>
                </div>
                <Link href="/api/auth/signout" className="flex items-center space-x-3 px-4 py-2 mt-2 text-red-400 hover:text-red-300 text-sm">
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col md:flex-row">
            {/* Mobile Top Bar */}
            <header className="md:hidden bg-gray-800 text-white p-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
                <div className="flex items-center gap-2">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700" aria-label="Toggle navigation menu">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 bg-gray-800 text-white border-r-gray-700 w-80">
                            <NavContent />
                        </SheetContent>
                    </Sheet>
                    <span className="font-bold tracking-wide">MU <span className="text-yellow-500">OPS</span></span>
                </div>
                <div className="bg-blue-600 rounded-full p-1.5">
                    <User className="h-4 w-4 text-white" />
                </div>
            </header>

            {/* Desktop Sidebar */}
            <aside className="w-64 bg-gray-800 text-white hidden md:flex flex-col h-screen sticky top-0">
                <NavContent />
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4 md:p-8">
                {children}
            </main>

            <Toaster />
        </div>
    );
}
