import { getAssets } from "@/actions/equipment";
import AssetManager from "@/components/equipment/AssetManager";

export default async function EquipmentPage() {
    const assets = await getAssets();

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Equipment Management</h1>
                <p className="text-gray-500">Manage fleet, maintenance, and usage.</p>
            </div>

            <AssetManager assets={assets} />
        </div>
    );
}
