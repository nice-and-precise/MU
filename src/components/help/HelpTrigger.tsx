"use client";

import { useHelp } from "@/components/help/HelpContext";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HelpTrigger({ helpKey, label = "Help" }: { helpKey: string; label?: string }) {
    const { showHelp } = useHelp();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.preventDefault(); showHelp(helpKey); }}
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            title={label}
        >
            <HelpCircle className="h-4 w-4" />
            <span className="sr-only">{label}</span>
        </Button>
    );
}
