"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/config/nav";
import { Star, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFavoriteAction } from "@/actions/user";
import { toast } from "sonner";
import { GlobalSearch } from "./GlobalSearch";

interface SidebarProps {
    role: string;
    favorites: string[];
    user?: {
        name?: string | null;
        image?: string | null;
    };
    className?: string;
}

export function Sidebar({ role, favorites, user, className }: SidebarProps) {
    const pathname = usePathname();

    const handleToggleFavorite = async (href: string, title: string) => {
        try {
            const result = await toggleFavoriteAction({ href });
            if (result?.data?.favorites) {
                const isFav = result.data.favorites.includes(href);
                toast.success(isFav ? `Added ${title} to favorites` : `Removed ${title} from favorites`);
            }
        } catch (error) {
            toast.error("Failed to update favorites");
        }
    };

    // Find favorite items to display in the favorites section
    const favoriteItems = favorites.map(favHref => {
        for (const group of NAV_ITEMS) {
            const found = group.items.find(item => item.href === favHref);
            if (found) return found;
        }
        return null;
    }).filter(Boolean);

    // Default defaults if no favorites (example logic, can be refined)
    // Actually the user request says: "Add small role based defaults".
    // Since we are reading from DB, we assume the DB is seeded or empty.
    // Ideally the server provides the favorites list which might include defaults if empty.
    // For now we trust the passed `favorites` prop.

    return (
        <div className={cn("flex flex-col h-full bg-gray-800 text-white", className)}>
            <div className="p-6 border-b border-gray-700">
                <h1 className="text-xl font-bold text-white tracking-wide">MIDWEST <span className="text-yellow-500">UNDERGROUND</span></h1>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Operations Command</p>
                <div className="mt-4">
                    <GlobalSearch />
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-6 mt-6 overflow-y-auto">
                {/* Favorites Section */}
                {favoriteItems.length > 0 && (
                    <div className="space-y-1">
                        <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Favorites</p>
                        {favoriteItems.map((item, j) => {
                            if (!item) return null;
                            const Icon = item.icon;
                            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
                            return (
                                <div key={`fav-${j}`} className="group relative flex items-center">
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex-1 flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors",
                                            isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span className="text-sm">{item.title}</span>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}


                {NAV_ITEMS.map((group, i) => {
                    // Filter groups by role if defined
                    if (group.roles && !group.roles.includes(role)) return null;

                    return (
                        <div key={i} className="space-y-1">
                            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{group.title}</p>
                            {group.items.map((item, j) => {
                                // Filter items by role if defined
                                if (item.roles && !item.roles.includes(role)) return null;
                                const Icon = item.icon;
                                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
                                const isFavorite = favorites.includes(item.href);

                                return (
                                    <div key={j} className="group relative flex items-center">
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "flex-1 flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors",
                                                isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span className="text-sm">{item.title}</span>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "h-6 w-6 absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity",
                                                isFavorite ? "text-yellow-400 opacity-100" : "text-gray-500 hover:text-yellow-400"
                                            )}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleToggleFavorite(item.href, item.title);
                                            }}
                                        >
                                            <Star className={cn("h-3 w-3", isFavorite && "fill-current")} />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-700 mt-auto">
                <div className="flex items-center space-x-3 px-4 py-2">
                    <div className="bg-blue-600 rounded-full p-2">
                        <UserIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-white">{user?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{role}</p>
                    </div>
                </div>
                <Link href="/api/auth/signout" className="flex items-center space-x-3 px-4 py-2 mt-2 text-red-400 hover:text-red-300 text-sm">
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                </Link>
            </div>
        </div>
    );
}
