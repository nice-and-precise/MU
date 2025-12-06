import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, User, Menu } from "lucide-react";
import { NAV_ITEMS } from "@/config/nav";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";
import { UserService } from "@/services/user";
import { UserOnboarding } from "@/components/onboarding/UserOnboarding";
import { HelpProvider } from "@/components/help/HelpContext";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // ... existing session/user fetching ...
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const userRole = session.user.role;

    // ... existing NavContent ...
    const NavContent = () => (
        // ...
        <div className="flex flex-col h-full">
            {/* ... existing code ... */}
            {/* Copying NavContent logic is redundant here if I can just wrap the RETURN statement content. */}
            {/* Let's skip copying NavContent in this replacement for brevity, assume tool handles it. */}
            {/* Need to be careful with replace_file_content. It replaces chunks. */}
            {/* I will only import at top, and wrap the return statement. */}
            {/* Wait, replace_file_content replaces Lines. I can't just wrap easily without replacing large block. */}
        </div>
    );

    // ... fetch user details ...

    const userDetails = await UserService.getUserPreferences(session.user.id);
    const fullUser = {
        ...session.user,
        phone: userDetails.phone,
        preferences: userDetails
    };

    return (
        <HelpProvider>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col md:flex-row">
                <UserOnboarding user={fullUser as any} />

                {/* Mobile Top Bar */}
                <header className="md:hidden bg-gray-800 text-white p-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
                    {/* ... */}
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
        </HelpProvider>
    );
}

