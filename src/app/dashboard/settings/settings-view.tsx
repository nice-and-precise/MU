"use client";

import { useState } from "react";
import { User, Bell, Shield, Wallet, Layers, Lock, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { EmployeeManager } from "@/components/financials/EmployeeManager";
import { Employee, Crew, CrewMember, User as PrismaUser } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/StatusBadge";

type EmployeeWithRelations = Employee & {
    crews: (CrewMember & { crew: Crew })[];
    foremanCrews: Crew[];
    user: PrismaUser | null;
};

interface SettingsViewProps {
    initialEmployees: EmployeeWithRelations[];
    preferences: { notifications: boolean };
}

export function SettingsView({ initialEmployees, preferences }: SettingsViewProps) {
    const [integrationKeys, setIntegrationKeys] = useState({ qbClientId: "", qbClientSecret: "" });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Control Center</h1>
                <p className="text-muted-foreground">Manage system configuration, access control, and integrations.</p>
            </div>

            <Tabs defaultValue="access" className="space-y-6">
                <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <TabsTrigger value="access" className="gap-2"><Shield className="w-4 h-4" /> Access & Team</TabsTrigger>
                    <TabsTrigger value="integrations" className="gap-2"><Layers className="w-4 h-4" /> Integrations</TabsTrigger>
                    <TabsTrigger value="general" className="gap-2"><Settings2 className="w-4 h-4" /> General</TabsTrigger>
                    <TabsTrigger value="audit" className="gap-2"><Lock className="w-4 h-4" /> Security Audit</TabsTrigger>
                </TabsList>

                {/* --- ACCESS & TEAM --- */}
                <TabsContent value="access" className="space-y-4 animate-in fade-in-50 duration-300">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold tracking-tight">Role-Based Access Control</h2>
                    </div>
                    <EmployeeManager employees={initialEmployees || []} />
                </TabsContent>

                {/* --- INTEGRATIONS --- */}
                <TabsContent value="integrations" className="space-y-6 animate-in fade-in-50 duration-300">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* QuickBooks */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-10 w-10 bg-[#2CA01C] rounded-lg text-white flex items-center justify-center font-bold text-lg">qb</div>
                                        <div>
                                            <CardTitle>QuickBooks Online</CardTitle>
                                            <CardDescription>Financials & Payroll Sync</CardDescription>
                                        </div>
                                    </div>
                                    <StatusBadge status="CONNECTED" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Client ID</label>
                                    <Input
                                        type="password"
                                        value={integrationKeys.qbClientId}
                                        onChange={(e) => setIntegrationKeys(prev => ({ ...prev, qbClientId: e.target.value }))}
                                        placeholder="••••••••••••••••"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Client Secret</label>
                                    <Input
                                        type="password"
                                        value={integrationKeys.qbClientSecret}
                                        onChange={(e) => setIntegrationKeys(prev => ({ ...prev, qbClientSecret: e.target.value }))}
                                        placeholder="••••••••••••••••"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline">Test Connection</Button>
                                    <Button>Update Credentials</Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* GSOC / Ticket Management */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-10 w-10 bg-blue-600 rounded-lg text-white flex items-center justify-center font-bold text-lg">811</div>
                                        <div>
                                            <CardTitle>GSOC Integration</CardTitle>
                                            <CardDescription>One-Call Ticket Sync</CardDescription>
                                        </div>
                                    </div>
                                    <StatusBadge status="PENDING" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Automated ticket fetching and status updates are currently in beta.
                                    Configure your state functionality below.
                                </p>
                                <Button className="w-full" variant="outline">Configure GSOC Proxy</Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* --- GENERAL --- */}
                <TabsContent value="general" className="space-y-4 animate-in fade-in-50 duration-300">
                    <Card>
                        <CardHeader>
                            <CardTitle>Application Defaults</CardTitle>
                            <CardDescription>Set system-wide default behaviors.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <label className="text-base font-medium">Default Theme</label>
                                    <p className="text-sm text-muted-foreground">System-wide appearance</p>
                                </div>
                                <ModeToggle />
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <label className="text-base font-medium">Notification Defaults</label>
                                    <p className="text-sm text-muted-foreground">Manage default alert policies</p>
                                </div>
                                <NotificationSettings initialEnabled={preferences.notifications} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- SECURITY AUDIT --- */}
                <TabsContent value="audit" className="space-y-4 animate-in fade-in-50 duration-300">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Logs</CardTitle>
                            <CardDescription>Recent system access and configuration changes.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Audit Log Viewer coming soon.</p>
                                <p className="text-sm">Logs are currently being captured in the database.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
