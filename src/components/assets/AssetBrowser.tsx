'use client';

import { useState } from 'react';
import { Asset } from '@prisma/client';
import { AssetCard } from './AssetCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type AssetWithRelations = Asset & {
    project?: { name: string } | null;
    inspections?: {
        id: string;
        createdAt: Date | string;
        passed: boolean;
        type: string;
    }[];
};

interface AssetBrowserProps {
    initialAssets: AssetWithRelations[];
}

export function AssetBrowser({ initialAssets }: AssetBrowserProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    // Get unique types from assets for filter options
    const assetTypes = Array.from(new Set(initialAssets.map(a => a.type))).sort();

    const filteredAssets = initialAssets.filter(asset => {
        const matchesSearch =
            asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.model?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = typeFilter === 'ALL' || asset.type === typeFilter;
        const matchesStatus = statusFilter === 'ALL' || asset.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
    });

    const clearFilters = () => {
        setSearchTerm('');
        setTypeFilter('ALL');
        setStatusFilter('ALL');
    };

    const hasActiveFilters = searchTerm || typeFilter !== 'ALL' || statusFilter !== 'ALL';

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-background border rounded-lg shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search assets..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Types</SelectItem>
                            {assetTypes.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Statuses</SelectItem>
                            <SelectItem value="AVAILABLE">Available</SelectItem>
                            <SelectItem value="IN_USE">In Use</SelectItem>
                            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                            <SelectItem value="RETIRED">Retired</SelectItem>
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear Filters">
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredAssets.map((asset) => (
                    // @ts-ignore - Date types mismatch across boundary is handled in component
                    <AssetCard key={asset.id} asset={asset} />
                ))}
                {filteredAssets.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border-dashed border-2">
                        <Filter className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p className="text-lg font-medium">No assets found</p>
                        <p className="text-sm">Try adjusting your filters or search terms.</p>
                        <Button variant="link" onClick={clearFilters} className="mt-2">
                            Clear all filters
                        </Button>
                    </div>
                )}
            </div>

            <div className="text-xs text-muted-foreground text-center">
                Showing {filteredAssets.length} of {initialAssets.length} assets
            </div>
        </div>
    );
}
