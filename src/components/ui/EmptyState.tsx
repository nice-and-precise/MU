import React from 'react';
import { FileX } from 'lucide-react';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: React.ComponentType<any>;
}

export function EmptyState({ title, description, icon: Icon = FileX, actionLabel, onAction }: EmptyStateProps & { actionLabel?: string; onAction?: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg bg-muted/30">
            <div className="p-3 bg-muted rounded-full mb-4">
                <Icon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mb-4">{description}</p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
