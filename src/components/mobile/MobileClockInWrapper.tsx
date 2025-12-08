"use client";

import { useState } from "react";
import { GeoClockIn } from "@/components/financials/GeoClockIn";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Project } from "@prisma/client";

interface MobileClockInWrapperProps {
    employeeId: string;
    projects: Project[];
    initialActiveEntry?: any;
}

export function MobileClockInWrapper({ employeeId, projects, initialActiveEntry }: MobileClockInWrapperProps) {
    // If active entry exists, use its project, otherwise default to first or none
    const [selectedProjectId, setSelectedProjectId] = useState<string>(
        initialActiveEntry?.projectId || (projects.length > 0 ? projects[0].id : "")
    );

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    return (
        <div className="space-y-4">
            {!initialActiveEntry && (
                <div className="space-y-2 px-2">
                    <label className="text-sm font-medium text-gray-700">Select Project Site</label>
                    <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                        <SelectTrigger className="w-full bg-white h-12 text-md">
                            <SelectValue placeholder="Select Project..." />
                        </SelectTrigger>
                        <SelectContent>
                            {projects.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {selectedProject ? (
                <GeoClockIn
                    projectId={selectedProject.id}
                    projectLat={selectedProject.latitude || 0}
                    projectLong={selectedProject.longitude || 0}
                    geofenceRadius={500}
                    employeeId={employeeId}
                    minimal={false} // Full Card for Mobile Experience
                    initialActiveEntry={initialActiveEntry}
                />
            ) : (
                <div className="text-center p-6 text-muted-foreground bg-gray-50 rounded-lg border border-dashed m-2">
                    Please select a project to clock in.
                </div>
            )}
        </div>
    );
}
