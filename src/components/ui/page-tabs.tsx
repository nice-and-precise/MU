"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface PageTabsProps {
    defaultValue: string;
    tabs: { value: string; label: string; icon?: React.ReactNode }[];
    children: React.ReactNode;
    className?: string; // Additional class for the root Tabs component
}

export function PageTabs({ defaultValue, tabs, children, className }: PageTabsProps) {
    return (
        <Tabs defaultValue={defaultValue} className={cn("space-y-6", className)}>
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 -mx-4 px-4 py-2 md:static md:mx-0 md:p-0">
                <ScrollArea className="w-full whitespace-nowrap rounded-md border bg-muted p-1">
                    <TabsList className="flex w-full justify-start bg-transparent p-0">
                        {tabs.map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                {tab.icon && <span className="h-4 w-4">{tab.icon}</span>}
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <ScrollBar orientation="horizontal" className="invisible" />
                </ScrollArea>
            </div>
            {children}
        </Tabs>
    );
}
