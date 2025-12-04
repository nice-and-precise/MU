"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BigButton } from "@/components/ui/BigButton";
import { Package, Droplet, Flame, AlertTriangle, RefreshCw } from "lucide-react";
import { getInventory, updateInventory } from "@/actions/inventory";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface InventoryManagerProps {
    projectId: string;
    userId?: string;
}

export function InventoryManager({ projectId, userId = "current-user" }: InventoryManagerProps) {
    const [activeTab, setActiveTab] = useState("fluids");
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [fuelAmount, setFuelAmount] = useState("");

    useEffect(() => {
        loadInventory();
    }, [projectId]);

    async function loadInventory() {
        setLoading(true);
        const res = await getInventory(projectId);
        if (res.success) {
            setInventory(res.data || []);
        }
        setLoading(false);
    }

    const handleQuickAdd = (itemName: string, quantity: number, unit: string) => {
        const item = inventory.find(i => i.name.toLowerCase().includes(itemName.toLowerCase()));

        if (!item) {
            toast.error(`Item "${itemName}" not found in inventory.`);
            return;
        }

        startTransition(async () => {
            const res = await updateInventory({
                itemId: item.id,
                quantity: Math.abs(quantity),
                type: quantity < 0 ? 'USE' : 'RESTOCK',
                projectId,
                userId: userId,
                notes: `Quick action via Field Dashboard`
            });

            if (res.success) {
                toast.success(`Logged: ${Math.abs(quantity)} ${unit} of ${itemName}`);
                loadInventory();
            } else {
                toast.error(res.error || "Failed to update inventory");
            }
        });
    };

    const handleLogFuel = () => {
        if (!fuelAmount || isNaN(parseFloat(fuelAmount))) {
            toast.error("Please enter a valid fuel amount");
            return;
        }
        // Mock fuel logging for now, as we don't have a specific fuel item ID logic here yet
        toast.success(`Logged ${fuelAmount} gallons of Diesel`);
        setFuelAmount("");
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Package className="h-6 w-6" />
                        Job Inventory & Consumables
                    </div>
                    <button onClick={loadInventory} disabled={loading} className="text-sm text-muted-foreground hover:text-blue-500">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-14 mb-4">
                        <TabsTrigger value="fluids" className="text-lg"><Droplet className="mr-2 h-4 w-4" /> Fluids</TabsTrigger>
                        <TabsTrigger value="fuel" className="text-lg"><Flame className="mr-2 h-4 w-4" /> Fuel</TabsTrigger>
                        <TabsTrigger value="parts" className="text-lg"><AlertTriangle className="mr-2 h-4 w-4" /> Parts</TabsTrigger>
                    </TabsList>

                    <TabsContent value="fluids" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <BigButton
                                label="BENTONITE"
                                subLabel="-1 Bag (50lb)"
                                onClick={() => handleQuickAdd("Bentonite", -1, "Bag")}
                                className="bg-slate-700 hover:bg-slate-600 h-32"
                                disabled={isPending}
                            />
                            <BigButton
                                label="POLYMER"
                                subLabel="-1 Jug (5gal)"
                                onClick={() => handleQuickAdd("Polymer", -1, "Jug")}
                                className="bg-slate-700 hover:bg-slate-600 h-32"
                                disabled={isPending}
                            />
                            <BigButton
                                label="SODA ASH"
                                subLabel="-1 Bag"
                                onClick={() => handleQuickAdd("Soda Ash", -1, "Bag")}
                                className="bg-slate-700 hover:bg-slate-600 h-32"
                                disabled={isPending}
                            />
                            <BigButton
                                label="RESTOCK"
                                variant="outline"
                                onClick={() => toast.info("Restock form coming soon")}
                                className="h-32 border-dashed"
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="fuel" className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="p-4 border rounded-lg bg-secondary/10">
                                <h3 className="font-bold mb-2">Log Fuel Usage</h3>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        placeholder="Gallons"
                                        className="flex-1 p-3 rounded border text-lg h-auto"
                                        value={fuelAmount}
                                        onChange={(e) => setFuelAmount(e.target.value)}
                                    />
                                    <BigButton label="LOG DIESEL" onClick={handleLogFuel} className="w-1/3" />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="parts" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <BigButton
                                label="USE SONDE BATTERIES"
                                subLabel="-4 AA Lithium"
                                onClick={() => handleQuickAdd("Lithium Batteries", -4, "Each")}
                                className="bg-orange-700 hover:bg-orange-600 h-32"
                                disabled={isPending}
                            />
                            <BigButton
                                label="BROKEN TOOTH"
                                subLabel="Report Damage"
                                onClick={() => toast.info("Damage report form coming soon")}
                                className="bg-red-700 hover:bg-red-600 h-32"
                            />
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="mt-6 border-t pt-4">
                    <h3 className="font-bold text-sm text-muted-foreground mb-2">Current Stock Levels</h3>
                    <div className="space-y-2 text-sm">
                        {inventory.length === 0 ? (
                            <p className="text-muted-foreground">No inventory loaded.</p>
                        ) : (
                            inventory.map(item => (
                                <div key={item.id} className="flex justify-between">
                                    <span>{item.name}</span>
                                    <span className={`font-mono ${item.quantityOnHand < (item.reorderPoint || 0) ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                                        {item.quantityOnHand} {item.unit || 'units'}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
