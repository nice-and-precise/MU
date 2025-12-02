"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeoClockIn } from "@/components/financials/GeoClockIn";
import { CrewDispatch } from "@/components/financials/CrewDispatch";
import { InventoryManager } from "@/components/field/InventoryManager";
import { InspectionChecklist } from "@/components/field/InspectionChecklist";
import { BigButton } from "@/components/ui/BigButton";
import { MapPin, CloudSun, FileText, Truck, AlertTriangle } from "lucide-react";

interface FieldDashboardProps {
    userRole: "Foreman" | "Operator" | "Laborer";
    projectId: string;
    projectLat: number;
    projectLong: number;
    projectName: string;
    projectAddress: string;
    currentUserId: string;
}

export function FieldDashboard({
    userRole,
    projectId,
    projectLat,
    projectLong,
    projectName,
    projectAddress,
    currentUserId,
    employees = [],
    assets = [],
    projects = []
}: FieldDashboardProps & {
    employees?: any[];
    assets?: any[];
    projects?: any[];
}) {
    const [activeTab, setActiveTab] = useState("overview");
    const [selectedAssetForInspection, setSelectedAssetForInspection] = useState<any>(null);

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
                <TabsList className="grid w-full grid-cols-6 h-14">
                    <TabsTrigger value="overview" className="text-lg">Home</TabsTrigger>
                    <TabsTrigger value="assets" className="text-lg">Assets</TabsTrigger>
                    <TabsTrigger value="inspections" className="text-lg">Inspect</TabsTrigger>
                    <TabsTrigger value="crew" className="text-lg">Crew</TabsTrigger>
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
                    <InventoryManager projectId={projectId} userId={currentUserId} />
                </TabsContent>

                <TabsContent value="inspections" className="space-y-4">
                    {!selectedAssetForInspection ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Equipment Inspections</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {assets.map(asset => (
                                        <div key={asset.id} className="p-4 border rounded-lg flex justify-between items-center">
                                            <div>
                                                <div className="font-bold">{asset.name}</div>
                                                <div className="text-sm text-muted-foreground">{asset.type}</div>
                                            </div>
                                            <BigButton
                                                label="INSPECT"
                                                onClick={() => setSelectedAssetForInspection(asset)}
                                                className="h-10 text-sm"
                                                fullWidth={false}
                                            />
                                        </div>
                                    ))}
                                    {assets.length === 0 && <p className="text-muted-foreground">No assets assigned to this project.</p>}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            <BigButton
                                label="BACK TO LIST"
                                variant="outline"
                                onClick={() => setSelectedAssetForInspection(null)}
                                className="mb-4"
                            />
                            <InspectionChecklist
                                assetId={selectedAssetForInspection.id}
                                assetName={selectedAssetForInspection.name}
                                onComplete={() => {
                                    setSelectedAssetForInspection(null);
                                    // Optionally switch tab or show success message
                                }}
                                inspectorId={currentUserId}
                            />
                        </div>
                    )}
                </TabsContent>



                <TabsContent value="crew" className="space-y-4">
                    <CrewDispatch
                        employees={employees}
                        assets={assets}
                        projects={projects}
                        variant={userRole === "Foreman" ? "default" : "default"}
                    />
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
                        employeeId={currentUserId}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}

