'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Clock, DollarSign, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileNavBar() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Schedule', href: '/mobile/schedule', icon: Calendar },
        { name: 'Time', href: '/mobile/time', icon: Clock },
        { name: 'Pay', href: '/mobile/pay', icon: DollarSign },
        { name: 'Profile', href: '/mobile/profile', icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
            <div className="flex justify-around items-center h-16 pb-[env(safe-area-inset-bottom)]">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1",
                                isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            <Icon className="w-6 h-6" />
                            <span className="text-xs font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
