import { getAssets } from '@/actions/assets';
import { AssetBrowser } from '@/components/assets/AssetBrowser';
import { AssetFormDialog } from '@/components/assets/AssetFormDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function AssetsPage() {
    const res = await getAssets();
    const assets = res.success && res.data ? res.data : [];

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

            {/* Client-side filtering/browser */}
            <AssetBrowser initialAssets={assets as any} />
        </div>
    );
}
