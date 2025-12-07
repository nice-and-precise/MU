import { getSuperStats } from "@/actions/dashboard";
import { CrewDispatch } from "@/components/financials/CrewDispatch";
import { getAvailableCrewMembers } from "@/actions/employees";
import { getAssets } from "@/actions/assets";
import { getActiveProjects } from "@/actions/projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardOnboarding } from "@/components/dashboard/DashboardOnboarding";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SuperDashboard() {
    const session = await getServerSession(authOptions);
    const statsRes = await getSuperStats();
    // Default values if data is missing
    const stats = statsRes.data || {
        myProjects: 0,
        openInspections: 0,
        dailyReportsToday: 0,
        projectAlerts: [] // Add typed default
    };

    // Explicitly cast or handle projectAlerts if TypeScript complains about the shape derived from service
    // For now assuming the action returns the shape we defined in service.
    const alerts = (stats as any).projectAlerts || [];

    const { data: employees } = await getAvailableCrewMembers();
    const res = await getAssets();
    const assets = res.success && res.data ? res.data : [];
    const { data: projects } = await getActiveProjects();

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
        <div className="p-8 space-y-6">
            <DashboardOnboarding
                role="SUPER"
                hasCompletedOnboarding={currentUser?.hasCompletedOnboarding ?? false}
                userName={currentUser?.name || ""}
                profileSetupComplete={profileSetupComplete}
            />
            {/* UX Promise Header */}
            <div className="bg-gradient-to-r from-[#003366] to-slate-900 p-6 rounded-lg text-white shadow-lg">
                <h1 className="text-3xl font-bold uppercase tracking-tight">Superintendent Dashboard</h1>
                <p className="text-lg opacity-90 font-medium mt-2">
                    "Keep crews productive and compliant today."
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Key Metrics */}
                <div className="bg-white p-6 rounded-lg border-t-4 border-[#003366] shadow-sm border-x border-b border-gray-200">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">My Projects</h3>
                    <p className="text-4xl font-extrabold text-gray-900 mt-2">{stats.myProjects}</p>
                </div>
                <div className="bg-white p-6 rounded-lg border-t-4 border-blue-500 shadow-sm border-x border-b border-gray-200">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Open Inspections</h3>
                    <p className="text-4xl font-extrabold text-blue-600 mt-2">{stats.openInspections}</p>
                </div>
                <div className="bg-white p-6 rounded-lg border-t-4 border-purple-600 shadow-sm border-x border-b border-gray-200">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Daily Reports (Today)</h3>
                    <p className="text-4xl font-extrabold text-purple-700 mt-2">{stats.dailyReportsToday}</p>
                </div>
            </div>

            {/* Today's Alerts Panel */}
            <Card className="border-t-4 border-red-500 shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                        <AlertTriangle className="mr-2 h-6 w-6 text-red-600" />
                        Today: Needs Attention
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {alerts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                            <p className="text-lg font-medium">All Clear!</p>
                            <p className="text-sm">No critical alerts for today.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {alerts.map((project: any) => (
                                <div key={project.id} className="p-4 bg-red-50 border border-red-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between">
                                    <div className="mb-2 md:mb-0">
                                        <h4 className="font-bold text-gray-900">{project.name}</h4>
                                        <ul className="mt-1 space-y-1">
                                            {project.alerts.map((alert: any, idx: number) => (
                                                <li key={idx} className="text-sm text-red-700 flex items-center">
                                                    <AlertCircle className="h-4 w-4 mr-2" />
                                                    {alert.message}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100" asChild>
                                        <Link href={`/dashboard/projects/${project.id}`}>
                                            View Project
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="mt-8">
                <CrewDispatch
                    employees={employees || []}
                    assets={assets || []}
                    projects={projects || []}
                />
            </div>
        </div>
    );
}
