import React from 'react';
import { FileX } from 'lucide-react';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: React.ComponentType<any>;
}

export function EmptyState({ title, description, icon: Icon = FileX }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg bg-muted/30">
            <div className="p-3 bg-muted rounded-full mb-4">
                <Icon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
        </div>
    );
}
