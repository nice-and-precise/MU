'use client';

import { Asset } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { AssetFormDialog } from './AssetFormDialog';
import { useState } from 'react';

interface AssetCardProps {
    asset: Asset & { project?: { name: string } | null };
}

export function AssetCard({ asset }: AssetCardProps) {
    const [open, setOpen] = useState(false);

    const statusColors: Record<string, string> = {
        AVAILABLE: 'bg-green-500',
        IN_USE: 'bg-blue-500',
        MAINTENANCE: 'bg-yellow-500',
        RETIRED: 'bg-gray-500',
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {asset.name}
                </CardTitle>
                <StatusBadge status={asset.status} />
            </CardHeader>
            <CardContent>
                <div className="grid gap-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-medium text-foreground">{asset.type}</span>
                    </div>
                    {asset.model && (
                        <div className="flex justify-between">
                            <span>Model:</span>
                            <span className="font-medium text-foreground">{asset.model}</span>
                        </div>
                    )}
                    {asset.serialNumber && (
                        <div className="flex justify-between">
                            <span>Serial:</span>
                            <span className="font-medium text-foreground">{asset.serialNumber}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span>Location:</span>
                        <span className="font-medium text-foreground">
                            {asset.project?.name || asset.location || 'Unassigned'}
                        </span>
                    </div>
                </div>
                <div className="mt-4">
                    <AssetFormDialog
                        asset={asset}
                        open={open}
                        onOpenChange={setOpen}
                        trigger={
                            <Button variant="outline" size="sm" className="w-full">
                                Edit Details
                            </Button>
                        }
                    />
                </div>
            </CardContent>
        </Card>
    );
}
