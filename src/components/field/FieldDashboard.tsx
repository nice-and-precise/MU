"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeoClockIn } from "@/components/financials/GeoClockIn";
import { CrewDispatch } from "@/components/financials/CrewDispatch";
import { InventoryManager } from "@/components/field/InventoryManager";
import { BigButton } from "@/components/ui/BigButton";
import { MapPin, CloudSun, FileText, Truck, AlertTriangle } from "lucide-react";

interface FieldDashboardProps {
    userRole: "Foreman" | "Operator" | "Laborer";
    projectId: string;
    projectLat: number;
    projectLong: number;
    projectName: string;
    projectAddress: string;
}

export function FieldDashboard({
    userRole,
    projectId,
    projectLat,
    projectLong,
    projectName,
    projectAddress
}: FieldDashboardProps) {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{projectName}</h1>
                    <p className="text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {projectAddress}
                    </p>
                </div>
                <div className="text-right">
                    <div className="font-bold text-orange-600">{userRole} View</div>
                    <div className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-14">
                    <TabsTrigger value="overview" className="text-lg">Home</TabsTrigger>
                    <TabsTrigger value="assets" className="text-lg">Assets</TabsTrigger>
                    <TabsTrigger value="docs" className="text-lg">Docs</TabsTrigger>
                    <TabsTrigger value="time" className="text-lg">Time</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CloudSun className="h-5 w-5" /> Weather
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">72°F</div>
                                <p className="text-muted-foreground">Partly Cloudy</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-orange-500" /> Daily Goals
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Complete 500ft bore</li>
                                    <li>Verify all utilities</li>
                                    <li>Safety meeting @ 8am</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {userRole === "Foreman" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Foreman's Log</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <textarea
                                    className="w-full min-h-[100px] p-2 border rounded-md bg-background"
                                    placeholder="Enter daily notes here..."
                                />
                                <BigButton label="SAVE NOTES" onClick={() => alert("Saved!")} className="mt-2" />
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="assets" className="space-y-4">
                    <InventoryManager projectId={projectId} />
                </TabsContent>

                <TabsContent value="docs" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" /> Project Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <BigButton label="BORE PLAN (PDF)" variant="secondary" onClick={() => alert("Open PDF")} />
                            <BigButton label="811 TICKET" variant="secondary" onClick={() => alert("Open Ticket")} />
                            <BigButton label="SAFETY PLAN" variant="secondary" onClick={() => alert("Open Safety Plan")} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="time" className="space-y-4">
                    <GeoClockIn
                        projectId={projectId}
                        projectLat={projectLat}
                        projectLong={projectLong}
                        geofenceRadius={500}
                        employeeId="current-user"
                    />

                    "use client";

                    import React, {useState} from "react";
                    import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
                    import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
                    import {GeoClockIn} from "@/components/financials/GeoClockIn";
                    import {CrewDispatch} from "@/components/financials/CrewDispatch";
                    import {InventoryManager} from "@/components/field/InventoryManager";
                    import {BigButton} from "@/components/ui/BigButton";
                    import {MapPin, CloudSun, FileText, Truck, AlertTriangle} from "lucide-react";

                    interface FieldDashboardProps {
                        userRole: "Foreman" | "Operator" | "Laborer";
                    projectId: string;
                    projectLat: number;
                    projectLong: number;
                    projectName: string;
                    projectAddress: string;
}

                    export function FieldDashboard({
                        userRole,
                        projectId,
                        projectLat,
                        projectLong,
                        projectName,
                        projectAddress
                    }: FieldDashboardProps) {
    const [activeTab, setActiveTab] = useState("overview");

                    return (
                    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">{projectName}</h1>
                                <p className="text-muted-foreground flex items-center gap-1">
                                    <MapPin className="h-4 w-4" /> {projectAddress}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-orange-600">{userRole} View</div>
                                <div className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</div>
                            </div>
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-4 h-14">
                                <TabsTrigger value="overview" className="text-lg">Home</TabsTrigger>
                                <TabsTrigger value="assets" className="text-lg">Assets</TabsTrigger>
                                <TabsTrigger value="docs" className="text-lg">Docs</TabsTrigger>
                                <TabsTrigger value="time" className="text-lg">Time</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <CloudSun className="h-5 w-5" /> Weather
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold">72°F</div>
                                            <p className="text-muted-foreground">Partly Cloudy</p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <AlertTriangle className="h-5 w-5 text-orange-500" /> Daily Goals
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Complete 500ft bore</li>
                                                <li>Verify all utilities</li>
                                                <li>Safety meeting @ 8am</li>
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </div>

                                {userRole === "Foreman" && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Foreman's Log</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <textarea
                                                className="w-full min-h-[100px] p-2 border rounded-md bg-background"
                                                placeholder="Enter daily notes here..."
                                            />
                                            <BigButton label="SAVE NOTES" onClick={() => alert("Saved!")} className="mt-2" />
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="assets" className="space-y-4">
                                <InventoryManager projectId={projectId} />
                            </TabsContent>

                            <TabsContent value="docs" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5" /> Project Documents
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid gap-2">
                                        <BigButton label="BORE PLAN (PDF)" variant="secondary" onClick={() => alert("Open PDF")} />
                                        <BigButton label="811 TICKET" variant="secondary" onClick={() => alert("Open Ticket")} />
                                        <BigButton label="SAFETY PLAN" variant="secondary" onClick={() => alert("Open Safety Plan")} />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="time" className="space-y-4">
                                <GeoClockIn
                                    projectId={projectId}
                                    projectLat={projectLat}
                                    projectLong={projectLong}
                                    geofenceRadius={500}
                                    employeeId="current-user"
                                />

                                {userRole === "Foreman" && (
                                    <div className="mt-8">
                                        <h3 className="text-xl font-bold mb-4">Crew Management</h3>
                                        <CrewDispatch />
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                    );
}
