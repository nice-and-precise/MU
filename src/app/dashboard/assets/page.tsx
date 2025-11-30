import { getAssets } from '@/actions/assets';
import { AssetCard } from '@/components/assets/AssetCard';
import { AssetFormDialog } from '@/components/assets/AssetFormDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function AssetsPage() {
    const { data: assets } = await getAssets();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Asset Management</h2>
                    <p className="text-muted-foreground">
                        Track and manage your fleet, equipment, and tooling.
                    </p>
                </div>
                <AssetFormDialog
                    trigger={
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Asset
                        </Button>
                    }
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {assets?.map((asset) => (
                    <AssetCard key={asset.id} asset={asset} />
                ))}
                {(!assets || assets.length === 0) && (
                    <div className="col-span-full text-center py-10 text-muted-foreground">
                        No assets found. Create one to get started.
                    </div>
                )}
            </div>
        </div>
    );
}
