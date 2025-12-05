"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Save, Loader2, AlertTriangle, Settings2 } from "lucide-react";
import Borehole3D from '../drilling/Borehole3D';
import EngineeringCharts from './EngineeringCharts';
import { SurveyStation, Obstacle } from '@/lib/drilling/types';
import { checkCollision, CollisionResult } from '@/lib/drilling/math/collision';
import { getProjectObstacles } from '@/actions/obstacles';
import { useParams } from 'next/navigation';
import { calculateDetailedPullback } from '@/lib/drilling/math/loads';
import { calculateDelftPMax, getSoilProperties } from '@/lib/drilling/math/hydraulics';
import { calculateTrueAzimuth } from '@/lib/drilling/math/magnetic';
import PDFExportButton from './PDFExportButton';
import { saveRodPlan, getRodPlan } from '@/actions/planning';
import { toast } from 'sonner';

// Simple types for the planner
interface PlannedRod {
    id: string;
    length: number; // ft
    pitch: number; // degrees (slope)
    azimuth: number; // degrees (compass)
    pullback?: number;
    pMax?: number;
}

interface PlanSettings {
    diameter: number;
    material: 'HDPE' | 'Steel';
    soil: 'Clay' | 'Sand' | 'Rock';
    declination: number;
}

export default function RodPlanningGrid() {
    const params = useParams();
    const projectId = params.id as string;

    const [rods, setRods] = useState<PlannedRod[]>([
        { id: '1', length: 15, pitch: -12, azimuth: 90 } // Entry rod
    ]);
    const [settings, setSettings] = useState<PlanSettings>({
        diameter: 4,
        material: 'HDPE',
        soil: 'Clay',
        declination: 0
    });

    const [calculatedPath, setCalculatedPath] = useState<SurveyStation[]>([]);
    const [obstacles, setObstacles] = useState<Obstacle[]>([]);
    const [collisionResults, setCollisionResults] = useState<CollisionResult[]>([]);
    const [isCalculating, setIsCalculating] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Load plan on mount
    useEffect(() => {
        if (projectId) {
            getRodPlan(projectId).then(res => {
                if (res?.data) {
                    if (res.data.rods.length > 0) setRods(res.data.rods);
                    if (res.data.settings) {
                        setSettings(prev => ({
                            ...prev,
                            diameter: res.data?.settings.diameter || prev.diameter,
                            material: (res.data?.settings.material as 'HDPE' | 'Steel') || prev.material,
                            soil: (res.data?.settings.soil as 'Clay' | 'Sand' | 'Rock') || prev.soil,
                            declination: res.data?.settings.declination || prev.declination
                        }));
                    }
                }
            });
        }
    }, [projectId]);

    const handleSave = async () => {
        const res = await saveRodPlan({ projectId, rods, settings });
        if (res?.success) {
            toast.success('Plan saved successfully');
        } else {
            toast.error('Failed to save plan: ' + (res?.error || 'Unknown error'));
        }
    };

    // Fetch obstacles on mount
    useEffect(() => {
        if (projectId) {
            getProjectObstacles(projectId).then(res => {
                if (res?.data) {
                    setObstacles(res.data as unknown as Obstacle[]);
                }
            });
        }
    }, [projectId]);

    useEffect(() => {
        const calculate = async () => {
            setIsCalculating(true);
            try {
                // 1. Calculate Trajectory (Geometry)
                const path: SurveyStation[] = [];
                let currentMd = 0;
                let currentTvd = 0;
                let currentNorth = 0;
                let currentEast = 0;

                // Initial station (Surface)
                path.push({
                    md: 0,
                    inc: rods[0].pitch + 90, // Convert pitch to inc
                    azi: calculateTrueAzimuth(rods[0].azimuth, settings.declination),
                    tvd: 0,
                    north: 0,
                    east: 0,
                    dls: 0
                });

                const enrichedRods = [...rods];

                // Calculate path step-by-step
                for (let i = 0; i < rods.length; i++) {
                    const rod = rods[i];
                    const inc = rod.pitch + 90; // Pitch 0 = 90 Inc
                    const azi = calculateTrueAzimuth(rod.azimuth, settings.declination);

                    const radInc = (inc * Math.PI) / 180;
                    const radAzi = (azi * Math.PI) / 180;

                    const dMd = rod.length;
                    const dTvd = dMd * Math.cos(radInc);
                    const dNorth = dMd * Math.sin(radInc) * Math.cos(radAzi);
                    const dEast = dMd * Math.sin(radInc) * Math.sin(radAzi);

                    currentMd += dMd;
                    currentTvd += dTvd;
                    currentNorth += dNorth;
                    currentEast += dEast;

                    path.push({
                        md: currentMd,
                        inc: inc,
                        azi: azi,
                        tvd: currentTvd,
                        north: currentNorth,
                        east: currentEast,
                        dls: 0
                    });

                    // 2. Physics & Hydraulics
                    const pullback = calculateDetailedPullback(
                        path,
                        settings.diameter,
                        settings.material,
                        settings.soil
                    );

                    const layerInput = { soilType: settings.soil, startDepth: 0, endDepth: 10000 };
                    const soilProps = getSoilProperties(layerInput, currentTvd);
                    const pMax = calculateDelftPMax(currentTvd, soilProps);

                    enrichedRods[i] = { ...rod, pullback, pMax };
                }

                setRods(enrichedRods);
                setCalculatedPath(path);

                // 3. Check for collisions
                if (obstacles.length > 0) {
                    const results = checkCollision(path, obstacles);
                    setCollisionResults(results);
                } else {
                    setCollisionResults([]);
                }
            } catch (error) {
                console.error("Calculation failed", error);
            } finally {
                setIsCalculating(false);
            }
        };

        const debounce = setTimeout(calculate, 500);
        return () => clearTimeout(debounce);
    }, [
        JSON.stringify(rods.map(r => ({ l: r.length, p: r.pitch, a: r.azimuth }))),
        settings,
        obstacles
    ]);

    const addRod = () => {
        const lastRod = rods[rods.length - 1];
        setRods([...rods, {
            id: Math.random().toString(36).substr(2, 9),
            length: 15,
            pitch: lastRod ? lastRod.pitch : -12,
            azimuth: lastRod ? lastRod.azimuth : 90
        }]);
    };

    const updateRod = (index: number, field: keyof PlannedRod, value: number) => {
        const newRods = [...rods];
        newRods[index] = { ...newRods[index], [field]: value };
        setRods(newRods);
    };

    const removeRod = (index: number) => {
        if (rods.length <= 1) return;
        const newRods = rods.filter((_, i) => i !== index);
        setRods(newRods);
    };

    const hasCollision = collisionResults.some(r => r.isCollision);
    const hasWarning = collisionResults.some(r => r.isWarning);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
            {/* Left: Grid Editor */}
            <Card className="lg:col-span-1 flex flex-col h-full">
                <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center">
                        <span>Rod Plan</span>
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setShowSettings(!showSettings)}>
                                <Settings2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={addRod}><Plus className="w-4 h-4" /></Button>
                            <Button size="sm" variant="outline" onClick={() => {
                                // Simple Auto-Plan: Add 10 rods straight
                                const lastRod = rods[rods.length - 1];
                                const newRods = [...rods];
                                for (let i = 0; i < 10; i++) {
                                    newRods.push({
                                        id: Math.random().toString(36).substr(2, 9),
                                        length: 15,
                                        pitch: lastRod.pitch,
                                        azimuth: lastRod.azimuth
                                    });
                                }
                                setRods(newRods);
                                toast.success('Added 10 rods');
                            }}>Auto-Plan</Button>
                            <PDFExportButton rods={rods} settings={settings} projectName={`Project ${projectId}`} />
                            <Button size="sm" onClick={handleSave}><Save className="w-4 h-4" /></Button>
                        </div>
                    </CardTitle>

                    {showSettings && (
                        <div className="bg-slate-50 p-3 rounded-md border text-sm grid grid-cols-2 gap-2 mt-2 animate-in slide-in-from-top-2">
                            <div>
                                <label className="block text-xs font-bold text-slate-500">Diameter (in)</label>
                                <Input
                                    type="number"
                                    value={settings.diameter}
                                    onChange={e => setSettings({ ...settings, diameter: Number(e.target.value) })}
                                    className="h-7"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500">Declination</label>
                                <Input
                                    type="number"
                                    value={settings.declination}
                                    onChange={e => setSettings({ ...settings, declination: Number(e.target.value) })}
                                    className="h-7"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500">Material</label>
                                <select
                                    value={settings.material}
                                    onChange={e => setSettings({ ...settings, material: e.target.value as any })}
                                    className="w-full h-7 text-xs border rounded px-1"
                                >
                                    <option value="HDPE">HDPE</option>
                                    <option value="Steel">Steel</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500">Soil</label>
                                <select
                                    value={settings.soil}
                                    onChange={e => setSettings({ ...settings, soil: e.target.value as any })}
                                    className="w-full h-7 text-xs border rounded px-1"
                                >
                                    <option value="Clay">Clay</option>
                                    <option value="Sand">Sand</option>
                                    <option value="Rock">Rock</option>
                                </select>
                            </div>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="flex-1 overflow-auto p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40px]">#</TableHead>
                                <TableHead className="w-[60px]">Len</TableHead>
                                <TableHead className="w-[60px]">Pitch</TableHead>
                                <TableHead className="w-[60px]">Azi</TableHead>
                                <TableHead className="w-[80px]">Pull (lb)</TableHead>
                                <TableHead className="w-[80px]">P_max</TableHead>
                                <TableHead className="w-[40px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rods.map((rod, i) => (
                                <TableRow key={rod.id}>
                                    <TableCell className="p-2 text-center">{i + 1}</TableCell>
                                    <TableCell className="p-1">
                                        <Input
                                            type="number"
                                            value={rod.length}
                                            onChange={(e) => updateRod(i, 'length', parseFloat(e.target.value))}
                                            className="h-7 w-full px-1 text-center"
                                        />
                                    </TableCell>
                                    <TableCell className="p-1">
                                        <Input
                                            type="number"
                                            value={rod.pitch}
                                            onChange={(e) => updateRod(i, 'pitch', parseFloat(e.target.value))}
                                            className="h-7 w-full px-1 text-center"
                                        />
                                    </TableCell>
                                    <TableCell className="p-1">
                                        <Input
                                            type="number"
                                            value={rod.azimuth}
                                            onChange={(e) => updateRod(i, 'azimuth', parseFloat(e.target.value))}
                                            className="h-7 w-full px-1 text-center"
                                        />
                                    </TableCell>
                                    <TableCell className="p-2 text-xs font-mono text-blue-600 font-bold text-right">
                                        {rod.pullback ? Math.round(rod.pullback).toLocaleString() : '-'}
                                    </TableCell>
                                    <TableCell className="p-2 text-xs font-mono text-purple-600 font-bold text-right">
                                        {rod.pMax ? Math.round(rod.pMax).toLocaleString() : '-'}
                                    </TableCell>
                                    <TableCell className="p-1">
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => removeRod(i)}>
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Right: Visualization & Charts */}
            <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
                <Tabs defaultValue="3d" className="h-full flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <TabsList>
                            <TabsTrigger value="3d">3D View</TabsTrigger>
                            <TabsTrigger value="charts">Engineering Charts</TabsTrigger>
                        </TabsList>

                        {/* Status Indicators */}
                        <div className="flex items-center gap-4">
                            {hasCollision && (
                                <div className="flex items-center text-red-600 animate-pulse font-bold text-sm">
                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                    COLLISION
                                </div>
                            )}
                            {!hasCollision && hasWarning && (
                                <div className="flex items-center text-orange-500 font-bold text-sm">
                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                    WARNING
                                </div>
                            )}
                            {isCalculating && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                        </div>
                    </div>

                    <TabsContent value="3d" className="flex-1 mt-0 relative min-h-0">
                        <Card className="h-full flex flex-col">
                            <CardContent className="flex-1 p-0 relative">
                                <Borehole3D
                                    stations={calculatedPath}
                                    ghostPath={[]}
                                    viewMode="iso"
                                    obstacles={obstacles}
                                />
                                {/* Collision Overlay */}
                                {collisionResults.length > 0 && (
                                    <div className="absolute bottom-4 left-4 right-4 bg-black/80 text-white p-4 rounded-md max-h-[150px] overflow-y-auto z-10">
                                        <h4 className="font-bold mb-2 text-sm uppercase tracking-wider">Safety Alerts</h4>
                                        <ul className="space-y-1 text-sm">
                                            {collisionResults.map((r, i) => (
                                                <li key={i} className={r.isCollision ? 'text-red-400' : 'text-orange-300'}>
                                                    {r.isCollision ? 'CRITICAL: ' : 'WARNING: '}
                                                    {r.minDistance.toFixed(1)}ft from {r.obstacleType} at {r.stationMd.toFixed(0)}ft MD
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="charts" className="flex-1 mt-0 overflow-y-auto">
                        <EngineeringCharts
                            data={rods.map((r, i) => ({
                                md: calculatedPath[i + 1]?.md || 0,
                                tvd: calculatedPath[i + 1]?.tvd || 0,
                                pullback: r.pullback || 0,
                                pMax: r.pMax || 0
                            }))}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
