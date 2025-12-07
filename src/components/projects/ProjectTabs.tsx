"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-8 w-fit overflow-x-auto">
            {tabs.map((tab) => {
                const isActive = tab.href === basePath
                    ? pathname === basePath
                    : pathname.startsWith(tab.href);

                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
                            isActive
                                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700/50"
                        )}
                    >
                        {tab.name}
                    </Link>
                );
            })}
        </div>
    );
}
