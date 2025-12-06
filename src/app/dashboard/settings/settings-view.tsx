"use client";

import { useState } from "react";
import { User, Bell, Shield, Wallet, Monitor } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { EmployeeManager } from "@/components/financials/EmployeeManager";
import { Employee, Crew, CrewMember, User as PrismaUser } from "@prisma/client";

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
    const [activeTab, setActiveTab] = useState("General");

    const renderContent = () => {
        switch (activeTab) {
            case "General":
                return (
                    <Card id="general" className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                            <CardDescription>Update your personal information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Full Name</label>
                                    <Input defaultValue="Owner User" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                                    <Input defaultValue="owner@midwestunderground.com" disabled className="bg-slate-50 dark:bg-slate-900" />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button className="bg-[#003366] text-white hover:bg-[#002244]">Save Changes</Button>
                            </div>
                        </CardContent>
                    </Card>
                );
            case "Notifications":
                return (
                    <Card className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <CardHeader>
                            <CardTitle>Preferences</CardTitle>
                            <CardDescription>Customize your application experience.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <label className="text-base font-medium">Dark Mode</label>
                                    <p className="text-sm text-muted-foreground">
                                        Toggle system-wide dark theme
                                    </p>
                                </div>
                                <ModeToggle />
                            </div>
                            <NotificationSettings initialEnabled={preferences.notifications ?? true} />
                        </CardContent>
                    </Card>
                );
            case "Integrations":
                return (
                    <Card id="integrations" className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <CardHeader>
                            <CardTitle>Integrations</CardTitle>
                            <CardDescription>Manage connections to external services.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-white rounded-lg border flex items-center justify-center font-bold text-green-600 shadow-sm">QB</div>
                                    <div>
                                        <p className="font-medium">QuickBooks Online</p>
                                        <p className="text-sm text-muted-foreground">Sync invoices, payroll, and expenses.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-sm font-medium text-green-600">Connected</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            case "Team":
                return (
                    <div id="team" className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight">Team Management</h2>
                        </div>
                        <EmployeeManager initialEmployees={initialEmployees || []} />
                    </div>
                );
            case "Billing":
                return (
                    <Card className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <CardHeader>
                            <CardTitle>Billing</CardTitle>
                            <CardDescription>Manage your subscription and billing details.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                Billing integration coming soon.
                            </div>
                        </CardContent>
                    </Card>
                );
            default:
                return null;
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and set e-mail preferences.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-[250px_1fr]">
                {/* Sidebar Navigation */}
                <nav className="flex flex-col space-y-1">
                    {["General", "Notifications", "Integrations", "Team", "Billing"].map((item) => (
                        <button
                            key={item}
                            onClick={() => setActiveTab(item)}
                            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === item
                                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                                }`}
                        >
                            {item === "General" && <User className="w-4 h-4" />}
                            {item === "Notifications" && <Bell className="w-4 h-4" />}
                            {item === "Integrations" && <Wallet className="w-4 h-4" />}
                            {item === "Team" && <Shield className="w-4 h-4" />}
                            {item === "Billing" && <Wallet className="w-4 h-4" />}
                            {item}
                        </button>
                    ))}
                </nav>

                <div className="space-y-6">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
