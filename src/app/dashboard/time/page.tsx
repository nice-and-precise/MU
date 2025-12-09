import { getActiveProjects } from "@/actions/projects";
import { GeoClockIn } from "@/components/financials/GeoClockIn";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin } from "lucide-react";
import { getClockStatus } from "@/actions/time";

export default async function TimePage() {
    const session = await getServerSession(authOptions);
    const { data: projects } = await getActiveProjects();
    const activeProjects = projects || [];

    // We need the user's ID to check clock status
    const userId = session?.user?.id;

    if (!userId) {
        return <div>Please log in to track time.</div>;
    }

    // Fetch active entry once to prevent N+1 fetches and ensure consistency
    const clockStatusRes = await getClockStatus(userId);
    const activeEntry = clockStatusRes?.success ? clockStatusRes.data : null;

    // Fetch assets for DVIR
    const { getAssets } = await import("@/actions/assets");
    const assetsRes = await getAssets();
    const assets = assetsRes.success && assetsRes.data ? assetsRes.data : [];

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-blue-100 text-blue-700 rounded-full">
                    <Clock className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Time</h1>
                    <p className="text-gray-500">Select a project to clock in or out.</p>
                </div>
            </div>

            {activeProjects.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center text-gray-500">
                        <p>No active projects assigned to you.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {activeProjects.map((project) => (
                        <Card key={project.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center justify-between text-lg">
                                    <span>{project.name}</span>
                                    <MapPin className="text-gray-400 w-5 h-5" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4 text-sm text-gray-500">
                                    {project.location || "No location specified"}
                                </div>
                                <GeoClockIn
                                    projectId={project.id}
                                    projectLat={project.latitude || 0}
                                    projectLong={project.longitude || 0}
                                    employeeId={userId}
                                    geofenceRadius={500} // Standard geofence
                                    minimal={true}
                                    initialActiveEntry={activeEntry}
                                    assets={assets}
                                />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
