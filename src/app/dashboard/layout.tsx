import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { User, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";
import { UserService } from "@/services/user";
import { UserOnboarding } from "@/components/onboarding/UserOnboarding";
import { HelpProvider } from "@/components/help/HelpContext";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { Sidebar } from "@/components/dashboard/Sidebar";

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
    const userDetails = await UserService.getUserPreferences(session.user.id);
    const favorites = (userDetails as any).favorites || [];

    const fullUser = {
        ...session.user,
        phone: userDetails.phone,
        preferences: userDetails
    };

    return (
        <HelpProvider>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col md:flex-row">
                <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground">
                    Skip to main content
                </a>
                <InstallPrompt />
                <UserOnboarding user={fullUser as any} />

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
                                <Sidebar
                                    role={userRole}
                                    favorites={favorites}
                                    user={fullUser}
                                />
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
                    <Sidebar
                        role={userRole}
                        favorites={favorites}
                        user={fullUser}
                    />
                </aside>

                {/* Main Content */}
                <main id="main-content" className="flex-1 overflow-auto p-4 md:p-8">
                    {children}
                </main>

                <Toaster />
            </div>
        </HelpProvider>
    );
}
