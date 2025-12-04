import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
    icon?: any;
}

export function EmptyState({
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
    icon: Icon = FileQuestion
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg bg-muted/50">
            <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-background">
                <Icon className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-sm">
                {description}
            </p>
            {actionLabel && (
                actionHref ? (
                    <Link href={actionHref}>
                        <Button>{actionLabel}</Button>
                    </Link>
                ) : (
                    <Button onClick={onAction}>{actionLabel}</Button>
                )
            )}
        </div>
    );
}
