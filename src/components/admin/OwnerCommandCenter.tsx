"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Truck, FileText, BarChart3 } from "lucide-react";
import { TicketManager } from "@/components/safety/TicketManager";
import Link from "next/link";

export function OwnerCommandCenter() {
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold font-heading">Owner Command Center</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Map Area */}
                <div className="lg:col-span-2 h-[600px] bg-muted rounded-xl border flex items-center justify-center relative overflow-hidden">
                    {/* Placeholder for Google Map */}
                    <div className="absolute inset-0 bg-muted/50 flex items-center justify-center text-muted-foreground">
                        <MapPin className="h-12 w-12 mb-2" />
                        <span className="text-xl font-bold font-heading">Live Operations Map</span>
                    </div>

                    {/* Overlay Pins (Mock) */}
                    <Button
                        variant="secondary"
                        className="absolute top-1/4 left-1/4 shadow-lg hover:scale-105 transition-transform"
                        aria-label="View Project Alpha"
                    >
                        <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse mr-2" />
                        <span className="font-bold text-sm">Project Alpha</span>
                    </Button>
                    <Button
                        variant="secondary"
                        className="absolute bottom-1/3 right-1/3 shadow-lg hover:scale-105 transition-transform"
                        aria-label="View Project Beta"
                    >
                        <div className="h-3 w-3 bg-secondary-foreground rounded-full mr-2" />
                        <span className="font-bold text-sm">Project Beta</span>
                    </Button>
                </div>

                {/* Control Panel */}
                <div className="space-y-4">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="font-heading">Project Controls</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="crew">
                                <TabsList className="w-full">
                                    <TabsTrigger value="crew" className="flex-1"><Users className="h-4 w-4" /></TabsTrigger>
                                    <TabsTrigger value="assets" className="flex-1"><Truck className="h-4 w-4" /></TabsTrigger>
                                    <TabsTrigger value="docs" className="flex-1"><FileText className="h-4 w-4" /></TabsTrigger>
                                    <TabsTrigger value="analytics" className="flex-1"><BarChart3 className="h-4 w-4" /></TabsTrigger>
                                </TabsList>

                                <TabsContent value="crew" className="space-y-4 mt-4">
                                    <div className="p-3 border rounded bg-card">
                                        <h3 className="font-bold mb-2 font-heading">Project Alpha Crew</h3>
                                        <div className="space-y-2 text-sm font-sans">
                                            <div className="flex justify-between"><span>John Doe (Foreman)</span> <span className="text-emerald-500 font-bold">● On Site</span></div>
                                            <div className="flex justify-between"><span>Jane Smith (Op)</span> <span className="text-emerald-500 font-bold">● On Site</span></div>
                                            <div className="flex justify-between"><span>Bob Johnson (Lab)</span> <span className="text-muted-foreground">○ Off</span></div>
                                        </div>
                                    </div>
                                    <Button asChild className="w-full font-bold">
                                        <Link href="/dashboard/crew">
                                            Manage Crew
                                        </Link>
                                    </Button>
                                </TabsContent>

                                <TabsContent value="assets" className="space-y-4 mt-4">
                                    <div className="p-3 border rounded bg-muted/30">
                                        <h3 className="font-bold mb-2 font-heading">Assigned Assets</h3>
                                        <ul className="list-disc list-inside text-sm space-y-1 font-sans">
                                            <li>Drill #1 (D24x40)</li>
                                            <li>Truck #12 (F-550)</li>
                                            <li>Trailer #5</li>
                                        </ul>
                                    </div>
                                    <Button asChild variant="secondary" className="w-full font-bold">
                                        <Link href="/dashboard/crew">
                                            Assign Equipment
                                        </Link>
                                    </Button>
                                </TabsContent>

                                <TabsContent value="docs" className="space-y-4 mt-4">
                                    <div className="h-[400px]">
                                        <TicketManager projectId="demo-project" />
                                    </div>
                                </TabsContent>
                                <TabsContent value="analytics" className="space-y-4 mt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 border rounded bg-secondary/10">
                                            <h3 className="font-bold text-secondary-foreground text-xs uppercase mb-1 font-heading">Safety</h3>
                                            <div className="text-2xl font-bold">124</div>
                                            <div className="text-xs text-muted-foreground">Days Without Incident</div>
                                        </div>
                                        <div className="p-3 border rounded bg-accent/10">
                                            <h3 className="font-bold text-accent text-xs uppercase mb-1 font-heading">Quality</h3>
                                            <div className="text-2xl font-bold">3</div>
                                            <div className="text-xs text-muted-foreground">Open Punch Items</div>
                                        </div>
                                    </div>
                                    <div className="p-3 border rounded bg-muted/30">
                                        <h3 className="font-bold mb-2 font-heading">Recent Activity</h3>
                                        <ul className="text-sm space-y-2 font-sans">
                                            <li className="flex justify-between"><span>Safety Meeting</span> <span className="text-muted-foreground">Today</span></li>
                                            <li className="flex justify-between"><span>JSA Submitted</span> <span className="text-muted-foreground">Today</span></li>
                                            <li className="flex justify-between"><span>Punch Item #123</span> <span className="text-muted-foreground">Yesterday</span></li>
                                        </ul>
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
