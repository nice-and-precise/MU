"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Users, Truck, FileText } from "lucide-react";
import { TicketManager } from "@/components/safety/TicketManager";

export function OwnerCommandCenter() {
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Owner Command Center</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Map Area */}
                <div className="lg:col-span-2 h-[600px] bg-muted rounded-xl border flex items-center justify-center relative overflow-hidden">
                    {/* Placeholder for Google Map */}
                    <div className="absolute inset-0 bg-slate-200 flex items-center justify-center text-slate-500">
                        <MapPin className="h-12 w-12 mb-2" />
                        <span className="text-xl font-bold">Live Operations Map</span>
                    </div>

                    {/* Overlay Pins (Mock) */}
                    <div className="absolute top-1/4 left-1/4 bg-white p-2 rounded shadow-lg flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform">
                        <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                        <span className="font-bold text-sm">Project Alpha</span>
                    </div>
                    <div className="absolute bottom-1/3 right-1/3 bg-white p-2 rounded shadow-lg flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform">
                        <div className="h-3 w-3 bg-orange-500 rounded-full" />
                        <span className="font-bold text-sm">Project Beta</span>
                    </div>
                </div>

                {/* Control Panel */}
                <div className="space-y-4">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Project Controls</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="crew">
                                <TabsList className="w-full">
                                    <TabsTrigger value="crew" className="flex-1"><Users className="h-4 w-4" /></TabsTrigger>
                                    <TabsTrigger value="assets" className="flex-1"><Truck className="h-4 w-4" /></TabsTrigger>
                                    <TabsTrigger value="docs" className="flex-1"><FileText className="h-4 w-4" /></TabsTrigger>
                                </TabsList>

                                <TabsContent value="crew" className="space-y-4 mt-4">
                                    <div className="p-3 border rounded bg-secondary/10">
                                        <h3 className="font-bold mb-2">Project Alpha Crew</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between"><span>John Doe (Foreman)</span> <span className="text-green-600">● On Site</span></div>
                                            <div className="flex justify-between"><span>Jane Smith (Op)</span> <span className="text-green-600">● On Site</span></div>
                                            <div className="flex justify-between"><span>Bob Johnson (Lab)</span> <span className="text-gray-400">○ Off</span></div>
                                        </div>
                                    </div>
                                    <button className="w-full py-2 bg-blue-600 text-white rounded font-bold text-sm hover:bg-blue-700">
                                        Manage Crew
                                    </button>
                                </TabsContent>

                                <TabsContent value="assets" className="space-y-4 mt-4">
                                    <div className="p-3 border rounded bg-secondary/10">
                                        <h3 className="font-bold mb-2">Assigned Assets</h3>
                                        <ul className="list-disc list-inside text-sm space-y-1">
                                            <li>Drill #1 (D24x40)</li>
                                            <li>Truck #12 (F-550)</li>
                                            <li>Trailer #5</li>
                                        </ul>
                                    </div>
                                    <button className="w-full py-2 bg-orange-600 text-white rounded font-bold text-sm hover:bg-orange-700">
                                        Assign Equipment
                                    </button>
                                </TabsContent>

                                <TabsContent value="docs" className="space-y-4 mt-4">
                                    <div className="h-[400px]">
                                        <TicketManager />
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
