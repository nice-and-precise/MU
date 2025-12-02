import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface BigButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: LucideIcon;
    label: string;
    subLabel?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    fullWidth?: boolean;
}

export function BigButton({
    icon: Icon,
    label,
    subLabel,
    variant = "default",
    fullWidth = true,
    className,
    ...props
}: BigButtonProps) {
    return (
        <Button
            variant={variant}
            className={cn(
                "min-h-[60px] py-4 px-6 flex items-center justify-center gap-4 transition-all active:scale-95",
                fullWidth ? "w-full" : "",
                className
            )}
            {...props}
        >
            {Icon && <Icon className="h-8 w-8" />}
            <div className="flex flex-col items-start text-left">
                <span className="text-lg font-bold leading-none">{label}</span>
                {subLabel && <span className="text-xs opacity-80 font-normal">{subLabel}</span>}
            </div>
        </Button>
    );
}
