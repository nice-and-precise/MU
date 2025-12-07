"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface ProjectTabsProps {
    projectId: string;
}

export function ProjectTabs({ projectId }: ProjectTabsProps) {
    const pathname = usePathname();
    const basePath = `/dashboard/projects/${projectId}`;

    const tabs = [
        { name: "Overview", href: basePath },
        { name: "Production", href: `${basePath}/production` },
        { name: "Financials", href: `${basePath}/financials` },
        { name: "Safety", href: `${basePath}/safety` },
        { name: "QC", href: `${basePath}/qc` },
        { name: "Changes", href: `${basePath}/changes` },
        { name: "Invoicing", href: `${basePath}/invoicing` },
        { name: "3D View", href: `${basePath}/3d` },
        { name: "216D Compliance", href: `${basePath}/216d` },
        { name: "Live Ops", href: `${basePath}/live` },
        { name: "Timeline", href: `${basePath}/timeline` },
    ];

    return (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 -mx-4 px-4 py-2 md:static md:mx-0 md:p-0 mb-6 border-b md:border-none">
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-1 p-1">
                    {tabs.map((tab) => {
                        const isActive = tab.href === basePath
                            ? pathname === basePath
                            : pathname.startsWith(tab.href);

                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                )}
                            >
                                {tab.name}
                            </Link>
                        );
                    })}
                </div>
                <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
        </div>
    );
}
