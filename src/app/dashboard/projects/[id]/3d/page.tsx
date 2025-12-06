import React from 'react';
import { getProject } from "@/actions/projects";
import { notFound } from "next/navigation";
import Project3DViewer from './Project3DViewer';
import { prisma } from '@/lib/prisma';
import { SurveyStation } from '@/lib/drilling/types';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default async function Project3DPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const res = await getProject(id);
    const project = res?.data;

    if (!project) {
        notFound();
    }

    // Fetch the first active bore or just the first bore for now
    const bore = await prisma.bore.findFirst({
        where: { projectId: id },
        include: {
            rodPasses: {
                orderBy: { sequence: 'asc' },
                select: {
                    linearFeet: true,
                    pitch: true,
                    azimuth: true,
                    sequence: true
                }
            }
        }
    });

    let stations: SurveyStation[] = [];

    if (bore && bore.rodPasses.length > 0) {
        // Import MCM calculator
        const { calculateTrajectory } = require('@/lib/drilling/math/mcm');

        // Map RodPasses to raw survey points
        let currentMD = 0;
        const rawPoints = bore.rodPasses.map((pass) => {
            currentMD += pass.linearFeet;

            // Convert Pitch (%) to Inclination (degrees)
            // HDD: 0% pitch = 90 deg Inc (Horizontal)
            // +% pitch = Up = >90 deg Inc
            // -% pitch = Down = <90 deg Inc
            // Wait, standard convention: 0 is Vertical Down. 90 is Horizontal.
            // If Pitch is +10% (Up), angle is atan(0.1).
            // We want to be 10 deg "above" horizontal.
            // So Inc = 90 + atan(0.1).
            // If Pitch is -10% (Down), we want to be 10 deg "below" horizontal (closer to vertical).
            // So Inc = 90 + atan(-0.1) = 90 - atan(0.1).
            // Math.atan returns radians, convert to degrees.

            const pitchPercent = pass.pitch || 0;
            const pitchDeg = (Math.atan(pitchPercent / 100) * 180) / Math.PI;
            const inc = 90 + pitchDeg;

            return {
                md: currentMD,
                inc: inc,
                azi: pass.azimuth || 0,
            };
        });

        // Calculate trajectory starting from surface (0,0,0)
        // Assuming entry is at the angle of the first rod for smoothness, 
        // or we could assume a standard entry angle.
        // Let's use the first point's angles for the tie-in to avoid a sharp dogleg at surface.
        const startInc = rawPoints.length > 0 ? rawPoints[0].inc : 90;
        const startAzi = rawPoints.length > 0 ? rawPoints[0].azi : 0;

        const tieIn: SurveyStation = {
            md: 0,
            inc: startInc,
            azi: startAzi,
            tvd: 0,
            north: 0,
            east: 0
        };

        stations = calculateTrajectory(rawPoints, tieIn);
    } else {
        // Default start point
        stations = [{ md: 0, inc: 90, azi: 0, tvd: 0, north: 0, east: 0 }];
    }

    return (
        <div className="p-6 h-full">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <Breadcrumb className="mb-2">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/dashboard/projects">Projects</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/dashboard/projects/${project.id}`}>{project.name}</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>3D View</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">3D Visualization</h1>
                    <p className="text-gray-500">Real-time digital twin powered by Rust Engine</p>
                </div>
                <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold uppercase">
                    {bore ? bore.name : 'No Active Bore'}
                </div>
            </div>

            <Project3DViewer initialStations={stations} />
        </div>
    );
}
