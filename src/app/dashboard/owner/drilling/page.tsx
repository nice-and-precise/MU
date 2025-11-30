"use client";

import React, { useState, useEffect } from 'react';
import { PlayCircle, Upload } from 'lucide-react';
import Borehole3D from '../../../../components/drilling/Borehole3D';
import BoreholeControls from '../../../../components/drilling/BoreholeControls';
import StripLog from '../../../../components/drilling/StripLog';
import SteeringGauge from '../../../../components/drilling/SteeringGauge';
import SurveyEditor from '../../../../components/drilling/SurveyEditor';
import ImportModal from '../../../../components/drilling/ImportModal';
import CollisionWarning from '../../../../components/drilling/CollisionWarning';
import RodPlanner from '../../../../components/drilling/RodPlanner';
import { calculateTrajectory } from '../../../../lib/drilling/math/mcm';
import { checkCollision, CollisionResult } from '../../../../lib/drilling/math/collision';
import { SurveyStation } from '../../../../lib/drilling/types';

export default function DrillingDashboard() {
    const [trajectory, setTrajectory] = useState<SurveyStation[]>([]);
    const [currentToolface, setCurrentToolface] = useState(0);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [collisions, setCollisions] = useState<CollisionResult[]>([]);
    const [ghostPath, setGhostPath] = useState<SurveyStation[]>([]);
    const [leftTab, setLeftTab] = useState<'survey' | 'plan'>('survey');

    // Demo State
    const [viewMode, setViewMode] = useState<'iso' | 'top' | 'side'>('iso');
    const [flyThrough, setFlyThrough] = useState(false);

    // Initial Mock Data
    useEffect(() => {
        loadSimpleDemo();

        // Simulate Toolface rotation
        const interval = setInterval(() => {
            setCurrentToolface(prev => (prev + 2) % 360);
        }, 50);

        return () => clearInterval(interval);
    }, []);

    const loadSimpleDemo = () => {
        const rawPoints = [
            { md: 0, inc: 0, azi: 0 },
            { md: 100, inc: 0, azi: 0 },
            { md: 200, inc: 5, azi: 45 },
            { md: 300, inc: 10, azi: 50 },
            { md: 400, inc: 15, azi: 55 },
            { md: 500, inc: 20, azi: 60 },
            { md: 600, inc: 25, azi: 65 },
            { md: 700, inc: 30, azi: 70 },
            { md: 800, inc: 35, azi: 75 },
            { md: 900, inc: 40, azi: 80 },
            { md: 1000, inc: 45, azi: 85 },
            { md: 1100, inc: 50, azi: 90 },
            { md: 1200, inc: 90, azi: 90 },
            { md: 1300, inc: 90, azi: 90 },
            { md: 1400, inc: 90, azi: 90 },
        ];
        setTrajectory(calculateTrajectory(rawPoints));
    };

    const loadRiverCrossingDemo = () => {
        // A complex S-turn trajectory
        const rawPoints = [
            { md: 0, inc: 0, azi: 90 },
            { md: 200, inc: 0, azi: 90 },
            { md: 400, inc: 12, azi: 90 }, // Build
            { md: 800, inc: 12, azi: 90 }, // Hold
            { md: 1000, inc: 25, azi: 110 }, // Turn Right
            { md: 1500, inc: 45, azi: 110 }, // Build
            { md: 2000, inc: 85, azi: 90 }, // Land
            { md: 2500, inc: 90, azi: 90 }, // Horizontal
            { md: 3000, inc: 90, azi: 90 },
        ];
        setTrajectory(calculateTrajectory(rawPoints));
    };

    const handleSurveyUpdate = (points: { md: number; inc: number; azi: number }[]) => {
        setTrajectory(calculateTrajectory(points));
    };

    const currentStation = trajectory[trajectory.length - 1] || { md: 0, inc: 0, azi: 0 };

    // Mock Environment Data
    const obstacles = [
        { id: 'obs1', type: 'gas' as const, x: 200, y: 15, z: 100, diameter: 2, length: 500, azimuth: 90 },
        { id: 'obs2', type: 'water' as const, x: 500, y: 25, z: 300, diameter: 4, length: 500, azimuth: 45 },
        { id: 'obs3', type: 'fiber' as const, x: 800, y: 5, z: 50, diameter: 1, length: 200, azimuth: 0 },
        // New Dense Utilities
        { id: 'obs4', type: 'sewer' as const, x: 600, y: 40, z: 400, diameter: 6, length: 600, azimuth: 135 },
        { id: 'obs5', type: 'electric' as const, x: 300, y: 10, z: 150, diameter: 1.5, length: 400, azimuth: 90 },
        { id: 'obs6', type: 'abandoned' as const, x: 700, y: 30, z: 500, diameter: 3, length: 300, azimuth: 20 },
    ];

    const targets = [
        { id: 't1', x: 800, y: 50, z: 600, width: 100, height: 20, depth: 100 },
    ];

    // Collision Detection
    useEffect(() => {
        if (trajectory.length > 0 && obstacles.length > 0) {
            const results = checkCollision(trajectory, obstacles);
            setCollisions(results);
        }
    }, [trajectory]);

    return (
        <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
            {/* HUD Header */}
            <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-20">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold tracking-tight text-slate-100">Directional Control</h1>
                    <div className="h-6 w-px bg-slate-700 mx-2"></div>
                    <div className="flex gap-6 text-sm">
                        <div>
                            <span className="text-slate-400 block text-xs uppercase tracking-wider">Bit Depth</span>
                            <span className="font-mono text-lg font-bold text-cyan-400">{currentStation.md.toFixed(1)} ft</span>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-xs uppercase tracking-wider">Inclination</span>
                            <span className="font-mono text-lg font-bold text-purple-400">{currentStation.inc.toFixed(1)}°</span>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-xs uppercase tracking-wider">Azimuth</span>
                            <span className="font-mono text-lg font-bold text-emerald-400">{currentStation.azi.toFixed(1)}°</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsImportOpen(true)}
                        className="flex items-center gap-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs font-bold uppercase tracking-wider transition-colors text-slate-200"
                    >
                        <Upload size={16} />
                        Import
                    </button>
                    <button
                        onClick={loadRiverCrossingDemo}
                        className="flex items-center gap-2 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                        <PlayCircle size={16} />
                        Load River Demo
                    </button>
                    <div className="text-right">
                        <span className="text-slate-400 block text-xs uppercase tracking-wider">Toolface</span>
                        <span className="font-mono text-lg font-bold text-white">{currentToolface.toFixed(0)}°</span>
                    </div>
                </div>
            </header>

            {/* Main Content Grid */}
            <div className="flex-1 flex overflow-hidden">

                {/* Left Panel: Editor (30%) */}
                <div className="w-[400px] flex flex-col border-r border-slate-200 bg-white z-10 shadow-xl">
                    <div className="flex border-b border-slate-200">
                        <button
                            onClick={() => setLeftTab('survey')}
                            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider ${leftTab === 'survey' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Survey Editor
                        </button>
                        <button
                            onClick={() => setLeftTab('plan')}
                            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider ${leftTab === 'plan' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Rod Planner
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        {leftTab === 'survey' ? (
                            <SurveyEditor stations={trajectory} onUpdate={handleSurveyUpdate} />
                        ) : (
                            <RodPlanner onPlanGenerated={setGhostPath} />
                        )}
                    </div>
                </div>

                {/* Right Panel: Visualization (70%) */}
                <div className="flex-1 flex flex-col bg-slate-50 p-4 gap-4 overflow-hidden">

                    {/* Top Row: 3D View & Gauge */}
                    <div className="flex-1 flex gap-4 min-h-0">
                        <div className="flex-[2] bg-slate-900 rounded-xl shadow-sm overflow-hidden relative border border-slate-800 group">
                            <div className="absolute top-3 left-3 z-10 bg-black/50 text-white px-2 py-1 rounded text-xs font-bold backdrop-blur-sm">
                                3D Digital Twin
                            </div>

                            <CollisionWarning collisions={collisions} />

                            <BoreholeControls
                                viewMode={viewMode}
                                flyThrough={flyThrough}
                                onViewChange={setViewMode}
                                onFlyThroughToggle={() => setFlyThrough(!flyThrough)}
                            />

                            <Borehole3D
                                stations={trajectory}
                                ghostPath={ghostPath}
                                obstacles={obstacles}
                                targets={targets}
                                viewMode={viewMode}
                                flyThrough={flyThrough}
                            />
                        </div>

                        <div className="flex-1 bg-white rounded-xl shadow-sm p-4 flex flex-col items-center justify-center border border-slate-200">
                            <h3 className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Steering Orientation</h3>
                            <SteeringGauge toolface={currentToolface} targetToolface={90} />
                        </div>
                    </div>

                    {/* Bottom Row: Strip Log */}
                    <div className="h-[300px] bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                        <StripLog data={trajectory} />
                    </div>

                </div>
            </div>

            <ImportModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                onImport={setTrajectory}
            />
        </div>
    );
}
