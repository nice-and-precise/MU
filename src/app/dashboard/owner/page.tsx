import { getOwnerStats } from "@/actions/dashboard";
import { ProductionChart } from "@/components/dashboard/ProductionChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { MapPin, DollarSign, AlertTriangle, FileCheck, TrendingUp, AlertOctagon } from "lucide-react";
import Link from "next/link";
import { CrewDispatch } from "@/components/financials/CrewDispatch";
import { getAvailableCrewMembers } from "@/actions/employees";
import { getAssets } from "@/actions/assets";
import { getActiveProjects } from "@/actions/projects";
import { ExpiringTicketsWidget } from "@/components/dashboard/ExpiringTicketsWidget";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardOnboarding } from "@/components/dashboard/DashboardOnboarding";
import { CommandCenterTour } from "@/components/dashboard/CommandCenterTour";
import { Button } from "@/components/ui/button"; // Add Button import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Removed Separator import as it was missing

export default async function OwnerDashboard() {
    const session = await getServerSession(authOptions);

    const [statsRes, { data: employees }, res, { data: projects }] = await Promise.all([
        getOwnerStats(),
        getAvailableCrewMembers(),
        getAssets(),
        getActiveProjects()
    ]);
    const assets = res.success && res.data ? res.data : [];
    const stats = statsRes.data || {
        activeProjects: 0,
        totalRevenue: 0,
        pendingApprovals: 0,
        inventoryValue: 0,
        activeFleet: 0,
        openSafetyIssues: 0,
        agedAr: 0,
        pendingChangeOrders: []
    };

    const currentUser = await prisma.user.findUnique({
        where: { id: session?.user?.id },
        select: { hasCompletedOnboarding: true, name: true, preferences: true }
    });

    // Check if profile is set up (phone exists in preferences)
    let profileSetupComplete = false;
    try {
        const prefs = typeof currentUser?.preferences === 'string'
            ? JSON.parse(currentUser.preferences)
            : currentUser?.preferences || {};
        profileSetupComplete = !!currentUser?.hasCompletedOnboarding;

        // Actually, looking at UserOnboarding logic: 
        // effectively "profile setup" is done if we shouldn't show the UserOnboarding modal.
        // UserOnboarding shows if !prefs.onboardingComplete.
        // So profileSetupComplete = !!prefs.onboardingComplete.
        profileSetupComplete = !!prefs.onboardingComplete;
    } catch (e) {
        profileSetupComplete = false;
    }

    return (
        <div className="p-8 space-y-8">
            <DashboardOnboarding
                role="OWNER"
                hasCompletedOnboarding={currentUser?.hasCompletedOnboarding ?? false}
                userName={currentUser?.name || ""}
                profileSetupComplete={profileSetupComplete}
            />

            {/* UX Promise Header */}
            <div className="bg-gradient-to-r from-gray-900 to-slate-800 p-6 rounded-lg text-white shadow-lg flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold uppercase tracking-tight">OWNERSHIP DASHBOARD</h1>
                    <p className="text-lg opacity-90 font-medium mt-2">
                        "Know where every project is in money, risk and schedule at a glance."
                    </p>
                </div>
                <CommandCenterTour />
            </div>

            <QuickActions role="OWNER" />

            {/* Today's Pulse Panel - The Core Promise Realized */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Financial Health Card */}
                <Card className="border-t-4 border-green-600 shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-gray-500 text-sm font-bold uppercase tracking-wider flex items-center">
                            <DollarSign className="h-4 w-4 mr-1 text-green-600" /> Financial Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Est. Revenue</p>
                                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
                                    ${stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                            <hr className="my-2 border-slate-200 dark:border-slate-700" />
                            <div>
                                <p className="text-sm text-gray-500">Aged AR ({'>'}30 Days)</p>
                                <p className={`text-2xl font-bold ${stats.agedAr > 0 ? 'text-red-600' : 'text-gray-700'}`}>
                                    ${(stats.agedAr || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Risk Flags Card */}
                <Card className={`border-t-4 shadow-md ${stats.openSafetyIssues > 0 ? 'border-red-600' : 'border-blue-500'}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-gray-500 text-sm font-bold uppercase tracking-wider flex items-center">
                            <AlertOctagon className={`h-4 w-4 mr-1 ${stats.openSafetyIssues > 0 ? 'text-red-600' : 'text-blue-500'}`} />
                            Risk Flags
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-500">Active Safety Issues</p>
                                    <p className={`text-3xl font-extrabold ${stats.openSafetyIssues > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {stats.openSafetyIssues}
                                    </p>
                                </div>
                                {stats.openSafetyIssues > 0 && (
                                    <Button variant="destructive" size="sm" asChild>
                                        <Link href="/dashboard/safety">Review</Link>
                                    </Button>
                                )}
                            </div>
                            <hr className="my-2 border-slate-200 dark:border-slate-700" />
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-600">
                                    Compliance Status
                                </div>
                                <div className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold uppercase">
                                    Good
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Action Items Card */}
                <Card className="border-t-4 border-orange-500 shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-gray-500 text-sm font-bold uppercase tracking-wider flex items-center">
                            <FileCheck className="h-4 w-4 mr-1 text-orange-500" />
                            Pending Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Change Orders</p>
                                <div className="flex justify-between items-baseline">
                                    <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
                                        {(stats.pendingChangeOrders as any[])?.length || 0}
                                    </p>
                                    <Link href="/dashboard/financials" className="text-sm text-blue-600 hover:underline">View All</Link>
                                </div>
                            </div>
                            <hr className="my-2 border-slate-200 dark:border-slate-700" />
                            <div>
                                <p className="text-sm text-gray-500">Pending Approvals</p>
                                <p className="text-xl font-bold text-gray-700">
                                    {stats.pendingApprovals}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Expiring Tickets & Activity Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 h-full">
                    <ExpiringTicketsWidget />
                </div>
                <div className="lg:col-span-2">
                    {/* Active Operations Map Widget */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col h-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Active Operations Map</h3>
                            <div className="flex space-x-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {stats.activeProjects} Active Projects
                                </span>
                                <Link href="/dashboard/map" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                                    Full Map &rarr;
                                </Link>
                            </div>
                        </div>
                        <div className="flex-1 bg-gray-100 dark:bg-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer min-h-[200px]">
                            {/* Mock Map Background */}
                            <div className="absolute inset-0 bg-[url('/satellite_map_mock.png')] bg-cover bg-center opacity-50 group-hover:opacity-75 transition-opacity"></div>
                            <div className="relative z-10 text-center">
                                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-lg mb-2 inline-flex items-center justify-center w-16 h-16">
                                    <MapPin className="h-8 w-8 text-blue-600" />
                                </div>
                                <p className="font-medium text-gray-900">Live View</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Production Chart Row */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Weekly Production Trends</h3>
                <ProductionChart />
            </div>

            <div className="mt-8">
                <CrewDispatch
                    variant="owner"
                    employees={employees || []}
                    assets={assets || []}
                    projects={projects || []}
                />
            </div>
        </div>
    );
}
