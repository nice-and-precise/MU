import { FieldDashboard } from "@/components/field/FieldDashboard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { getAvailableCrewMembers } from "@/actions/employees";
import { getAssets } from "@/actions/assets";
import { getActiveProjects } from "@/actions/projects";
import { getTickets } from "@/actions/tickets";
import { getCrewStats } from "@/actions/dashboard"; // Import new action
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardOnboarding } from "@/components/dashboard/DashboardOnboarding";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, FileText, MapPin, AlertTriangle, Plus, HardHat, Truck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CrewDashboard() {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user?.role as "Foreman" | "Operator" | "Laborer") || "Laborer";

    // Fetch data
    const { data: employees } = await getAvailableCrewMembers();
    const res = await getAssets();
    const assets = res.success && res.data ? res.data : [];
    const { data: projects } = await getActiveProjects();
    const { data: crewStats } = await getCrewStats(); // Fetch tailored stats

    // Assuming the crew is assigned to a specific project, or we pick the first active one for now
    const currentProject = projects?.[0] || {
        id: "demo-project",
        name: "Demo Project",
        location: "123 Main St",
        latitude: 45.118,
        longitude: -95.042
    };

    // Fetch active ticket for the project
    const { data: tickets } = await getTickets({ projectId: currentProject.id, status: 'ACTIVE' });
    const activeTicketId = tickets?.[0]?.id;

    // Check onboarding
    const currentUser = await prisma.user.findUnique({
        where: { id: session?.user?.id },
        select: { hasCompletedOnboarding: true, name: true, preferences: true }
    });

    // Check if profile is set up
    let profileSetupComplete = false;
    try {
        const prefs = typeof currentUser?.preferences === 'string'
            ? JSON.parse(currentUser.preferences)
            : currentUser?.preferences || {};
        profileSetupComplete = !!prefs.onboardingComplete;
    } catch (e) {
        profileSetupComplete = false;
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            <DashboardOnboarding
                role={userRole.toUpperCase()}
                hasCompletedOnboarding={currentUser?.hasCompletedOnboarding ?? false}
                userName={currentUser?.name || ""}
                profileSetupComplete={profileSetupComplete}
            />

            {/* UX Promise Header */}
            <div className="bg-gradient-to-r from-blue-900 to-slate-800 p-6 rounded-lg text-white shadow-lg">
                <h1 className="text-2xl font-bold mb-2">Crew Dashboard</h1>
                <p className="text-lg opacity-90 font-medium">
                    "Clock in, log production, and stay out of trouble with minimum taps."
                </p>
            </div>

            {/* My Work Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-t-4 border-blue-600 shadow-md">
                    <CardContent className="p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800 dark:text-gray-100">
                            <HardHat className="mr-2 h-6 w-6 text-blue-600" />
                            My Work: Today
                        </h2>

                        <div className="space-y-4">
                            {/* Active Time Entry */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center">
                                    <Clock className={`h-5 w-5 mr-3 ${crewStats?.activeTimeEntry ? 'text-green-500' : 'text-gray-400'}`} />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Time Status</p>
                                        <p className="font-bold text-gray-900 dark:text-white">
                                            {crewStats?.activeTimeEntry ? 'Clocked In' : 'Not Clocked In'}
                                        </p>
                                    </div>
                                </div>
                                {/* Mobile Link */}
                                <Button variant={crewStats?.activeTimeEntry ? "destructive" : "default"} size="sm" asChild className="md:hidden">
                                    <Link href="/mobile/time">
                                        {crewStats?.activeTimeEntry ? 'Clock Out' : 'Clock In'}
                                    </Link>
                                </Button>
                                {/* Desktop Link */}
                                <Button variant={crewStats?.activeTimeEntry ? "destructive" : "default"} size="sm" asChild className="hidden md:inline-flex">
                                    <Link href="/dashboard/time">
                                        {crewStats?.activeTimeEntry ? 'Clock Out' : 'Clock In'}
                                    </Link>
                                </Button>
                            </div>

                            {/* Daily Report Status */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center">
                                    <FileText className={`h-5 w-5 mr-3 ${crewStats?.dailyReportStatus !== 'NOT_STARTED' ? 'text-blue-500' : 'text-gray-400'}`} />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Daily Report</p>
                                        <p className="font-bold text-gray-900 dark:text-white">
                                            {crewStats?.dailyReportStatus === 'NOT_STARTED' ? 'Not Started' : crewStats?.dailyReportStatus}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/dashboard/reports/${crewStats?.dailyReportId ?? 'new'}`}>
                                        {crewStats?.dailyReportStatus === 'NOT_STARTED' ? 'Create' : 'Edit'}
                                    </Link>
                                </Button>
                            </div>

                            {/* Next Work Location */}
                            <div className="flex items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                                <MapPin className="h-5 w-5 mr-3 text-red-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Next Location</p>
                                    <p className="font-bold text-gray-900 dark:text-white truncate max-w-[200px] md:max-w-xs">
                                        {crewStats?.nextLocation}
                                    </p>
                                </div>
                            </div>

                            {/* Labor Cost Lens */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
                                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Crew Cost (Today)</p>
                                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                                        ${crewStats?.todaysLaborCost?.toFixed(0) || '0'}
                                    </p>
                                </div>
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">Effective Rate</p>
                                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                        ${crewStats?.effectiveHourlyRate?.toFixed(2) || '0'}
                                        <span className="text-sm font-normal text-muted-foreground">/hr</span>
                                    </p>
                                </div>
                            </div>

                            {/* Assigned Assets */}
                            {crewStats?.assignedAssets && crewStats.assignedAssets.length > 0 && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Truck className="h-4 w-4 text-orange-600" />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Assigned Equipment</span>
                                    </div>
                                    <div className="space-y-2">
                                        {crewStats.assignedAssets.map((asset: any) => (
                                            <div key={asset.id} className="flex justify-between items-center text-sm p-2 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700">
                                                <span className="font-medium">{asset.name}</span>
                                                <span className="text-xs text-muted-foreground">{asset.type}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Links */}
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700" asChild>
                                <Link href="/dashboard/rod-pass">
                                    <Plus className="mr-2 h-4 w-4" /> Log Rod
                                </Link>
                            </Button>
                            <Button className="w-full" variant="secondary" asChild>
                                <Link href="/dashboard/tickets">
                                    <AlertTriangle className="mr-2 h-4 w-4" /> Report Issue
                                </Link>
                            </Button>
                        </div>

                    </CardContent>
                </Card>

                {/* Secondary Panels (Optional or keep FieldDashboard) */}
                <div className="hidden lg:block">
                    <p className="text-gray-500 italic mb-2">Live Field view...</p>
                    <FieldDashboard
                        userRole={userRole}
                        projectId={currentProject.id}
                        projectName={currentProject.name}
                        projectAddress={currentProject.location || "Unknown Location"}
                        projectLat={currentProject.latitude || 0}
                        projectLong={currentProject.longitude || 0}
                        currentUserId={session?.user?.id || ""}
                        employees={employees || []}
                        assets={assets || []}
                        projects={projects || []}
                        activeTicketId={activeTicketId}
                        hideTimeControls={true}
                    />
                </div>
            </div>

            {/* Mobile Field Dashboard fallback */}
            <div className="lg:hidden">
                <FieldDashboard
                    userRole={userRole}
                    projectId={currentProject.id}
                    projectName={currentProject.name}
                    projectAddress={currentProject.location || "Unknown Location"}
                    projectLat={currentProject.latitude || 0}
                    projectLong={currentProject.longitude || 0}
                    currentUserId={session?.user?.id || ""}
                    employees={employees || []}
                    assets={assets || []}
                    projects={projects || []}
                    activeTicketId={activeTicketId}
                    hideTimeControls={true}
                />
            </div>

            {/* Role-based slimming: Hide QuickActions for Laborers on mobile */}
            <div className={userRole === 'Laborer' ? 'hidden md:block' : ''}>
                <QuickActions role={userRole} />
            </div>
        </div >
    );
}
