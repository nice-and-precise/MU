"use client"

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, User } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";

interface MobileNavProps {
    role: string;
    favorites: string[];
    user?: {
        name?: string | null;
        image?: string | null;
        preferences?: any;
        phone?: string | null;
    };
}

export function MobileNav({ role, favorites, user }: MobileNavProps) {
    const [open, setOpen] = useState(false);

    return (
        <header className="md:hidden bg-gray-800 text-white p-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
            <div className="flex items-center gap-2">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700" aria-label="Toggle navigation menu">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 bg-gray-800 text-white border-r-gray-700 w-80">
                        <Sidebar
                            role={role}
                            favorites={favorites}
                            user={user}
                            onNavigate={() => setOpen(false)}
                        />
                    </SheetContent>
                </Sheet>
                <span className="font-bold tracking-wide">MU <span className="text-yellow-500">OPS</span></span>
            </div>
            <div className="bg-blue-600 rounded-full p-1.5">
                <User className="h-4 w-4 text-white" />
            </div>
        </header>
    );
}
