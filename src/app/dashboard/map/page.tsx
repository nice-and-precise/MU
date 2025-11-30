import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight } from "lucide-react";

export default async function GlobalMapPage() {
    const activeProjects = await prisma.project.findMany({
        where: { status: { in: ["IN_PROGRESS", "PLANNED"] } },
        include: { _count: { select: { bores: true } } }
    });

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Global Operations Map</h1>
                <div className="flex justify-between items-center">
                    <p className="text-gray-500">Select a project to view its 3D Digital Twin.</p>
                    <Link href="/dashboard/map/scenarios">
                        <Button variant="outline" className="gap-2">
                            <MapPin className="h-4 w-4" />
                            View Example Scenarios
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeProjects.map((project) => (
                    <Card key={project.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-blue-500" />
                                {project.name}
                            </CardTitle>
                            <CardDescription>{project.location}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">{project._count.bores} Active Bores</span>
                                <Link
                                    href={`/dashboard/projects/${project.id}/3d`}
                                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                                >
                                    View 3D Map <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {activeProjects.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500">No active projects found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
