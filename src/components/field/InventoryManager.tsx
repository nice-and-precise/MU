"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BigButton } from "@/components/ui/BigButton";
import { Package, Droplet, Flame, AlertTriangle } from "lucide-react";

interface InventoryManagerProps {
    projectId: string;
}

export function InventoryManager({ projectId }: InventoryManagerProps) {
    const [activeTab, setActiveTab] = useState("fluids");

    const handleQuickAdd = (item: string, quantity: number, unit: string) => {
        // In real app: Server action to create InventoryTransaction
        console.log(`Adding ${quantity} ${unit} of ${item} to project ${projectId}`);
        alert(`Logged: ${quantity} ${unit} of ${item}`);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-6 w-6" />
                    Job Inventory & Consumables
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
                            />
                            <BigButton
                                label="POLYMER"
                                subLabel="-1 Jug (5gal)"
                                onClick={() => handleQuickAdd("Polymer", -1, "Jug")}
                                className="bg-slate-700 hover:bg-slate-600 h-32"
                            />
                            <BigButton
                                label="SODA ASH"
                                subLabel="-1 Bag"
                                onClick={() => handleQuickAdd("Soda Ash", -1, "Bag")}
                                className="bg-slate-700 hover:bg-slate-600 h-32"
                            />
                            <BigButton
                                label="RESTOCK"
                                variant="outline"
                                onClick={() => alert("Open Restock Form")}
                                className="h-32 border-dashed"
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="fuel" className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="p-4 border rounded-lg bg-secondary/10">
                                <h3 className="font-bold mb-2">Log Fuel Usage</h3>
                                <div className="flex gap-2">
                                    <input type="number" placeholder="Gallons" className="flex-1 p-3 rounded border text-lg" />
                                    <BigButton label="LOG DIESEL" onClick={() => alert("Logged Fuel")} className="w-1/3" />
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
                            />
                            <BigButton
                                label="BROKEN TOOTH"
                                subLabel="Report Damage"
                                onClick={() => alert("Report Damage")}
                                className="bg-red-700 hover:bg-red-600 h-32"
                            />
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="mt-6 border-t pt-4">
                    <h3 className="font-bold text-sm text-muted-foreground mb-2">Recent Activity</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>Used 5 Bags Bentonite</span> <span className="text-muted-foreground">10:30 AM - John Doe</span></div>
                        <div className="flex justify-between"><span>Used 1 Jug Polymer</span> <span className="text-muted-foreground">09:15 AM - Jane Smith</span></div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
