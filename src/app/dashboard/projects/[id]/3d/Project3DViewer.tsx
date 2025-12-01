"use client";

import React, { useState, useEffect } from 'react';
import Borehole3D from '@/components/drilling/Borehole3D';
import BoreholeControls from '@/components/drilling/BoreholeControls';
import StripLog from '@/components/drilling/StripLog';
import SteeringGauge from '@/components/drilling/SteeringGauge';
import { SurveyStation, Obstacle } from '@/lib/drilling/types';
import { calculatePathWithRust } from '@/lib/api/rustEngine';

interface Project3DViewerProps {
    initialStations: SurveyStation[];
    obstacles?: Obstacle[];
    targets?: any[];
}

export default function Project3DViewer({ initialStations, obstacles = [], targets = [] }: Project3DViewerProps) {
    const [trajectory, setTrajectory] = useState<SurveyStation[]>(initialStations);
    const [viewMode, setViewMode] = useState<'iso' | 'top' | 'side'>('iso');
    const [flyThrough, setFlyThrough] = useState(false);
    const [calculatedPath, setCalculatedPath] = useState<any[]>([]);

    // On mount or when stations change, calculate path using Rust engine
    useEffect(() => {
        async function updatePath() {
            if (trajectory.length > 0) {
                try {
                    const points = await calculatePathWithRust(trajectory);

                    // Merge calculated coordinates (x, y, z) back into trajectory stations
                    // Assuming 1:1 mapping and order is preserved
                    const updatedTrajectory = trajectory.map((station, index) => {
                        const point = points[index];
                        if (point) {
                            return {
                                ...station,
                                north: point.y,
                                east: point.x,
                                tvd: point.z
                            };
                        }
                        return station;
                    });

                    setTrajectory(updatedTrajectory);
                    setCalculatedPath(points);
                    console.log("Calculated path via Rust:", points.length, "points");
                } catch (e) {
                    console.error("Error calculating path:", e);
                }
            }
        }
        // Only run if the first station has no coordinates (initial load) 
        // or if we explicitly want to re-calculate (e.g. after editing, which isn't implemented yet)
        // To avoid infinite loop (since we update trajectory), we check a condition or use a ref.
        // For now, let's just run once on mount if we assume initialStations are "raw".
        // Or better, check if north/east are 0.
        if (trajectory.length > 0 && trajectory[0].north === 0 && trajectory[0].east === 0) {
            updatePath();
        }
    }, [initialStations]); // Depend on initialStations, not trajectory, to avoid loop. 
    // Actually, we should initialize state with initialStations, then update it.

    // Better approach: Use a separate effect or just run it.
    // If we include 'trajectory' in deps and update 'trajectory', we loop.
    // We'll use a ref to track if we've calculated.

    useEffect(() => {
        async function init() {
            if (initialStations.length > 0) {
                try {
                    const points = await calculatePathWithRust(initialStations);
                    const updated = initialStations.map((s, i) => {
                        const p = points[i];
                        return p ? { ...s, north: p.y, east: p.x, tvd: p.z } : s;
                    });
                    setTrajectory(updated);
                } catch (e) { console.error(e); }
            }
        }
        init();
    }, [initialStations]);

    const currentStation = trajectory[trajectory.length - 1] || { measuredDepth: 0, inclination: 0, azimuth: 0 };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] gap-4">
            {/* Top Row: 3D View & Gauge */}
            <div className="flex-1 flex gap-4 min-h-0">
                <div className="flex-[3] bg-slate-900 rounded-xl shadow-sm overflow-hidden relative border border-slate-800 group">
                    <div className="absolute top-3 left-3 z-10 bg-black/50 text-white px-2 py-1 rounded text-xs font-bold backdrop-blur-sm">
                        3D Digital Twin (Rust Powered)
                    </div>

                    <BoreholeControls
                        viewMode={viewMode}
                        flyThrough={flyThrough}
                        onViewChange={setViewMode}
                        onFlyThroughToggle={() => setFlyThrough(!flyThrough)}
                    />

                    <Borehole3D
                        stations={trajectory}
                        obstacles={obstacles}
                        targets={targets}
                        viewMode={viewMode}
                        flyThrough={flyThrough}
                    />
                </div>

                <div className="flex-1 flex flex-col gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex flex-col items-center justify-center border border-gray-200 dark:border-gray-700 flex-1">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Steering Orientation</h3>
                        <SteeringGauge toolface={0} targetToolface={90} />
                        <div className="mt-4 grid grid-cols-2 gap-4 w-full text-center">
                            <div>
                                <div className="text-xs text-gray-500 uppercase">Pitch</div>
                                <div className="text-xl font-mono font-bold text-purple-500">{currentStation.inc.toFixed(1)}%</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 uppercase">Azimuth</div>
                                <div className="text-xl font-mono font-bold text-emerald-500">{currentStation.azi.toFixed(1)}°</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Strip Log */}
            <div className="h-[200px] bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                <StripLog data={trajectory} />
            </div>
        </div>
    );
}
