"use client";

import React, { useState } from 'react';
import Borehole3D from '@/components/drilling/Borehole3D';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SurveyStation } from '@/lib/drilling/types';

// Mock Data for Scenarios
const SCENARIOS = {
    urban: {
        name: "Urban Utility Corridor",
        description: "Navigate a crowded utility easement with gas, water, and fiber lines.",
        obstacles: [
            { id: 'g1', type: 'gas', x: 200, y: 5, z: 0, diameter: 4, length: 1000, azimuth: 90 },
            { id: 'w1', type: 'water', x: 220, y: 8, z: 0, diameter: 12, length: 1000, azimuth: 90 },
            { id: 'f1', type: 'fiber', x: 180, y: 3, z: 0, diameter: 2, length: 1000, azimuth: 90 },
        ],
        targets: [
            { id: 't1', x: 500, y: 10, z: 0, width: 20, height: 20, depth: 20 }
        ],
        stations: [
            { md: 0, inc: 90, azi: 0, tvd: 0, north: 0, east: 0 },
            { md: 100, inc: 90, azi: 0, tvd: 0, north: 100, east: 0 },
            { md: 200, inc: 90, azi: 5, tvd: 0, north: 200, east: 10 },
            { md: 300, inc: 85, azi: 10, tvd: 5, north: 300, east: 30 },
            { md: 400, inc: 90, azi: 0, tvd: 10, north: 400, east: 40 },
            { md: 500, inc: 90, azi: 0, tvd: 10, north: 500, east: 40 },
        ] as SurveyStation[]
    },
    river: {
        name: "River Crossing",
        description: "Deep bore under a riverbed with varying soil layers.",
        obstacles: [],
        targets: [
            { id: 't1', x: 800, y: 0, z: 0, width: 50, height: 50, depth: 50 }
        ],
        stations: [
            { md: 0, inc: 78, azi: 0, tvd: 0, north: 0, east: 0 },
            { md: 100, inc: 78, azi: 0, tvd: 20, north: 98, east: 0 },
            { md: 200, inc: 85, azi: 0, tvd: 35, north: 195, east: 0 },
            { md: 300, inc: 90, azi: 0, tvd: 40, north: 295, east: 0 },
            { md: 400, inc: 90, azi: 0, tvd: 40, north: 395, east: 0 },
            { md: 500, inc: 90, azi: 0, tvd: 40, north: 495, east: 0 },
            { md: 600, inc: 95, azi: 0, tvd: 35, north: 594, east: 0 },
            { md: 700, inc: 102, azi: 0, tvd: 20, north: 690, east: 0 },
            { md: 800, inc: 102, azi: 0, tvd: 0, north: 785, east: 0 },
        ] as SurveyStation[]
    },
    rock: {
        name: "Hard Rock Drilling",
        description: "Steep entry into rock formation requiring slow steering.",
        obstacles: [],
        targets: [
            { id: 't1', x: 300, y: 50, z: 0, width: 30, height: 30, depth: 30 }
        ],
        stations: [
            { md: 0, inc: 60, azi: 0, tvd: 0, north: 0, east: 0 },
            { md: 50, inc: 60, azi: 0, tvd: 43, north: 25, east: 0 },
            { md: 100, inc: 65, azi: 0, tvd: 85, north: 55, east: 0 },
            { md: 150, inc: 70, azi: 0, tvd: 125, north: 90, east: 0 },
            { md: 200, inc: 75, azi: 0, tvd: 160, north: 130, east: 0 },
            { md: 250, inc: 80, azi: 0, tvd: 190, north: 175, east: 0 },
            { md: 300, inc: 85, azi: 0, tvd: 215, north: 220, east: 0 },
        ] as SurveyStation[]
    }
};

export default function ScenariosPage() {
    const [activeScenario, setActiveScenario] = useState<keyof typeof SCENARIOS>('urban');

    const scenario = SCENARIOS[activeScenario];

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">3D Map Scenarios</h1>
                    <p className="text-sm text-gray-500">{scenario.description}</p>
                </div>
                <div className="flex gap-2">
                    {(Object.keys(SCENARIOS) as Array<keyof typeof SCENARIOS>).map((key) => (
                        <Button
                            key={key}
                            variant={activeScenario === key ? "default" : "outline"}
                            onClick={() => setActiveScenario(key)}
                            className="capitalize"
                        >
                            {SCENARIOS[key].name}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="flex-1 bg-slate-900 relative">
                {/* @ts-ignore - Obstacle type mismatch in mock vs component, casting/ignoring for demo */}
                <Borehole3D
                    stations={scenario.stations}
                    obstacles={scenario.obstacles as any}
                    targets={scenario.targets}
                    viewMode="iso"
                />

                <div className="absolute top-4 left-4 bg-black/50 p-4 rounded text-white backdrop-blur-sm max-w-xs">
                    <h3 className="font-bold mb-2">{scenario.name}</h3>
                    <p className="text-sm opacity-80">{scenario.description}</p>
                    <div className="mt-4 text-xs space-y-1">
                        <p><strong>Total Depth:</strong> {Math.max(...scenario.stations.map(s => s.tvd)).toFixed(1)} ft</p>
                        <p><strong>Total Length:</strong> {scenario.stations[scenario.stations.length - 1].md.toFixed(1)} ft</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
