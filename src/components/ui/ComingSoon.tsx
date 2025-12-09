
import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

interface ComingSoonProps {
    title?: string;
    description?: string;
    className?: string;
}

export function ComingSoon({
    title = "Feature In Development",
    description = "This module is scheduled for the Post-Pilot phase (Phase 4).",
    className
}: ComingSoonProps) {
    return (
        <Card className={`border-dashed border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10 ${className}`}>
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-yellow-100 dark:bg-yellow-900/20 p-4 rounded-full mb-4">
                    <Construction className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}
