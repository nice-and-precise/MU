"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GeoClockIn } from "@/components/financials/GeoClockIn";
import { InventoryManager } from "@/components/field/InventoryManager";
import { InspectionChecklist } from "@/components/field/InspectionChecklist";
import { BigButton } from "@/components/ui/BigButton";
import { MapPin, CloudSun, FileText, AlertTriangle, CheckCircle2, Circle, Clock, Wrench, Shield, File } from "lucide-react";
import { RemarkForm } from "@/components/216d/RemarkForm";
import { DamageForm } from "@/components/216d/DamageForm";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";

interface FieldDashboardProps {
    userRole: "Foreman" | "Operator" | "Laborer";
    projectId: string;
    projectLat: number;
    projectLong: number;
    projectName: string;
    projectAddress: string;
    currentUserId: string;
    employees?: any[];
    assets?: any[];
    projects?: any[];
    activeTicketId?: string;
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
    projects = [],
    activeTicketId
}: FieldDashboardProps) {
    const [activeTab, setActiveTab] = useState("today");
    const [selectedAssetForInspection, setSelectedAssetForInspection] = useState<any>(null);
    const [showRemarkForm, setShowRemarkForm] = useState(false);
    const [showDamageForm, setShowDamageForm] = useState(false);

    // Mock state for "Today" checklist
    const [checklist, setChecklist] = useState({
        clockIn: false,
        preTrip: false,
        safetyMeeting: false,
        production: false,
        clockOut: false
    });

    const handleChecklistAction = (key: keyof typeof checklist) => {
        // In a real app, this would check status or navigate
        if (key === 'clockIn') {
            // Logic handled by GeoClockIn component mostly, but we can simulate state update
        }
        setChecklist(prev => ({ ...prev, [key]: true }));
        toast.success(`Marked ${key} as complete`);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{projectName}</h1>
                    <p className="text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {projectAddress}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <div className="font-bold text-orange-600">{userRole} View</div>
                        <div className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</div>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-14">
                    <TabsTrigger value="today" className="flex flex-col gap-1 py-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs">Today</span>
                    </TabsTrigger>
                    <TabsTrigger value="gear" className="flex flex-col gap-1 py-1">
                        <Wrench className="h-4 w-4" />
                        <span className="text-xs">Gear</span>
                    </TabsTrigger>
                    <TabsTrigger value="safety" className="flex flex-col gap-1 py-1">
                        <Shield className="h-4 w-4" />
                        <span className="text-xs">Safety</span>
                    </TabsTrigger>
                    <TabsTrigger value="docs" className="flex flex-col gap-1 py-1">
                        <File className="h-4 w-4" />
                        <span className="text-xs">Docs</span>
                    </TabsTrigger>
                </TabsList>

                {/* TODAY TAB */}
                <TabsContent value="today" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Daily Workflow</CardTitle>
                                <CardDescription>Complete these steps daily</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* 1. Clock In */}
                                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        {checklist.clockIn ? <CheckCircle2 className="text-green-500 h-6 w-6" /> : <Circle className="text-muted-foreground h-6 w-6" />}
                                        <span className={checklist.clockIn ? "line-through text-muted-foreground" : "font-medium"}>1. Clock In</span>
                                    </div>
                                    <GeoClockIn
                                        projectId={projectId}
                                        projectLat={projectLat}
                                        projectLong={projectLong}
                                        geofenceRadius={500}
                                        employeeId={currentUserId}
                                        minimal={true} // Assuming GeoClockIn can support a minimal mode, or we just wrap it
                                    />
                                </div>

                                {/* 2. Pre-Trip */}
                                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        {checklist.preTrip ? <CheckCircle2 className="text-green-500 h-6 w-6" /> : <Circle className="text-muted-foreground h-6 w-6" />}
                                        <span className={checklist.preTrip ? "line-through text-muted-foreground" : "font-medium"}>2. Pre-Trip Inspection</span>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => { setActiveTab("gear"); toast.info("Select an asset to inspect"); }}>Go to Gear</Button>
                                </div>

                                {/* 3. Safety Meeting */}
                                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        {checklist.safetyMeeting ? <CheckCircle2 className="text-green-500 h-6 w-6" /> : <Circle className="text-muted-foreground h-6 w-6" />}
                                        <span className={checklist.safetyMeeting ? "line-through text-muted-foreground" : "font-medium"}>3. Safety Meeting</span>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => { setActiveTab("safety"); toast.info("Complete JSA in Safety tab"); }}>Go to Safety</Button>
                                </div>

                                {/* 4. Production */}
                                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        {checklist.production ? <CheckCircle2 className="text-green-500 h-6 w-6" /> : <Circle className="text-muted-foreground h-6 w-6" />}
                                        <span className={checklist.production ? "line-through text-muted-foreground" : "font-medium"}>4. Production Logs</span>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => toast.info("Navigate to Drilling Ops to log production")}>Log</Button>
                                </div>

                                {/* 5. Clock Out */}
                                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        {checklist.clockOut ? <CheckCircle2 className="text-green-500 h-6 w-6" /> : <Circle className="text-muted-foreground h-6 w-6" />}
                                        <span className={checklist.clockOut ? "line-through text-muted-foreground" : "font-medium"}>5. Clock Out</span>
                                    </div>
                                    <Button size="sm" variant="destructive" onClick={() => handleChecklistAction('clockOut')}>Clock Out</Button>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <CloudSun className="h-5 w-5" /> Weather
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">72°F</div>
                                    <p className="text-muted-foreground">Partly Cloudy</p>
                                </CardContent>
                            </Card>

                            {userRole === "Foreman" && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">Foreman's Log</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <textarea
                                            className="w-full min-h-[100px] p-2 border rounded-md bg-background mb-2"
                                            placeholder="Enter daily notes here..."
                                        />
                                        <BigButton label="SAVE NOTES" onClick={() => toast.success("Notes saved successfully")} />
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* GEAR TAB */}
                <TabsContent value="gear" className="space-y-4">
                    <Tabs defaultValue="assets" className="w-full">
                        <TabsList className="w-full">
                            <TabsTrigger value="assets" className="flex-1">Assets & Inspections</TabsTrigger>
                            <TabsTrigger value="inventory" className="flex-1">Inventory</TabsTrigger>
                        </TabsList>

                        <TabsContent value="assets" className="mt-4">
                            {!selectedAssetForInspection ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Equipment List</CardTitle>
                                        <CardDescription>Select an asset to inspect</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 gap-3">
                                            {assets.map(asset => (
                                                <div key={asset.id} className="p-4 border rounded-lg flex justify-between items-center bg-card hover:bg-accent/50 transition-colors">
                                                    <div>
                                                        <div className="font-bold">{asset.name}</div>
                                                        <div className="text-sm text-muted-foreground">{asset.type}</div>
                                                    </div>
                                                    <Button
                                                        onClick={() => setSelectedAssetForInspection(asset)}
                                                    >
                                                        Inspect
                                                    </Button>
                                                </div>
                                            ))}
                                            {assets.length === 0 && <EmptyState title="No Assets" description="No assets assigned to this project." />}
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    <Button variant="ghost" onClick={() => setSelectedAssetForInspection(null)} className="mb-2">
                                        ← Back to List
                                    </Button>
                                    <InspectionChecklist
                                        assetId={selectedAssetForInspection.id}
                                        assetName={selectedAssetForInspection.name}
                                        onComplete={() => {
                                            setSelectedAssetForInspection(null);
                                            toast.success("Inspection submitted");
                                            handleChecklistAction('preTrip'); // Auto-update checklist
                                        }}
                                        inspectorId={currentUserId}
                                    />
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="inventory" className="mt-4">
                            <InventoryManager projectId={projectId} userId={currentUserId} />
                        </TabsContent>
                    </Tabs>
                </TabsContent>

                {/* SAFETY TAB */}
                <TabsContent value="safety" className="space-y-4">
                    {!showRemarkForm && !showDamageForm ? (
                        <div className="space-y-4">
                            <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-500">
                                        <AlertTriangle className="h-5 w-5" /> 216D Compliance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <BigButton
                                        label="REQUEST REMARK / DAMAGED MARKS"
                                        variant="secondary"
                                        onClick={() => setShowRemarkForm(true)}
                                        className="bg-amber-100 text-amber-900 hover:bg-amber-200 border-amber-200"
                                    />
                                    <BigButton
                                        label="REPORT FACILITY DAMAGE / CONTACT"
                                        variant="destructive"
                                        onClick={() => setShowDamageForm(true)}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Safety Documents & Forms</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <BigButton label="JSA / TAILGATE MEETING" variant="outline" onClick={() => {
                                        toast.success("JSA Form Opened (Mock)");
                                        handleChecklistAction('safetyMeeting');
                                    }} />
                                    <BigButton label="VIEW 811 TICKET" variant="outline" onClick={() => toast.info("Opening 811 Ticket...")} />
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <Button variant="ghost" onClick={() => { setShowRemarkForm(false); setShowDamageForm(false); }} className="mb-2">
                                ← Back to Safety Menu
                            </Button>

                            {showRemarkForm && (
                                <Card>
                                    <CardHeader><CardTitle>Locate Remark Request</CardTitle></CardHeader>
                                    <CardContent>
                                        <RemarkForm
                                            projectId={projectId}
                                            ticketId={activeTicketId || ""}
                                            onClose={() => setShowRemarkForm(false)}
                                        />
                                    </CardContent>
                                </Card>
                            )}
                            {showDamageForm && (
                                <Card>
                                    <CardHeader><CardTitle className="text-red-600">Damage Event Report</CardTitle></CardHeader>
                                    <CardContent>
                                        <DamageForm
                                            projectId={projectId}
                                            ticketId={activeTicketId || ""}
                                            onClose={() => setShowDamageForm(false)}
                                        />
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </TabsContent>

                {/* DOCS TAB */}
                <TabsContent value="docs" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" /> Project Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            <BigButton label="BORE PLAN (PDF)" variant="secondary" onClick={() => toast.info("Opening Bore Plan PDF...")} />
                            <BigButton label="811 TICKET" variant="secondary" onClick={() => toast.info("Opening 811 Ticket...")} />
                            <BigButton label="SAFETY PLAN" variant="secondary" onClick={() => toast.info("Opening Safety Plan...")} />
                            <BigButton label="PROJECT PRINTS" variant="secondary" onClick={() => toast.info("Opening Prints...")} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Empty State Helper for imports */}
            <div className="hidden">
                <EmptyState title="" description="" />
            </div>
        </div>
    );
}
