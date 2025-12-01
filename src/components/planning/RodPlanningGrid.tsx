"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Save, Loader2, AlertTriangle } from "lucide-react";
import Borehole3D from '../drilling/Borehole3D';
import { SurveyStation } from '@/lib/drilling/types';
import { calculatePathWithRust } from '@/lib/api/engine';
import { checkCollision, CollisionResult, Obstacle } from '@/lib/drilling/collision';
import { getProjectObstacles } from '@/actions/obstacles';
import { useParams } from 'next/navigation';

// Simple types for the planner
interface PlannedRod {
    id: string;
    length: number; // ft
    pitch: number; // degrees (slope)
    azimuth: number; // degrees (compass)
}

export default function RodPlanningGrid() {
    const params = useParams();
    const projectId = params.id as string;

    const [rods, setRods] = useState<PlannedRod[]>([
        { id: '1', length: 15, pitch: -12, azimuth: 90 } // Entry rod
    ]);
    const [calculatedPath, setCalculatedPath] = useState<SurveyStation[]>([]);
    const [obstacles, setObstacles] = useState<Obstacle[]>([]);
    const [collisionResult, setCollisionResult] = useState<CollisionResult | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);

    // Fetch obstacles on mount
    useEffect(() => {
        if (projectId) {
            getProjectObstacles(projectId).then(res => {
                if (res.success && res.data) {
                    // Map Prisma Obstacle to our internal Obstacle type if needed
                    // Prisma types match our interface mostly, but we need to ensure types align
                    setObstacles(res.data as unknown as Obstacle[]);
                }
            });
        }
    }, [projectId]);

    useEffect(() => {
        const calculate = async () => {
            setIsCalculating(true);
            try {
                // Prepare input for Rust Engine
                const inputs = rods.map((rod, index) => {
                    // Simple accumulation for MD
                    let md = 0;
                    for (let i = 0; i <= index; i++) md += rods[i].length;

                    return {
                        md,
                        pitch: rod.pitch,
                        az: rod.azimuth
                    };
                });

                // Add surface point if not implicit
                if (inputs.length > 0 && inputs[0].md > 0) {
                    inputs.unshift({ md: 0, pitch: 0, az: rods[0].azimuth });
                }

                const result = await calculatePathWithRust(inputs);
                setCalculatedPath(result);

                // Check for collisions
                if (obstacles.length > 0) {
                    const collision = checkCollision(result, obstacles);
                    setCollisionResult(collision);
                }
            } catch (error) {
                console.error("Calculation failed", error);
            } finally {
                setIsCalculating(false);
            }
        };

        const debounce = setTimeout(calculate, 500);
        return () => clearTimeout(debounce);
    }, [rods, obstacles]);

    const addRod = () => {
        const lastRod = rods[rods.length - 1];
        setRods([...rods, {
            id: Math.random().toString(36).substr(2, 9),
            length: 15, // Standard rod
            pitch: lastRod ? lastRod.pitch : 0, // Continue previous pitch
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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
            {/* Left: Grid Editor */}
            <Card className="lg:col-span-1 flex flex-col h-full">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Rod Plan</span>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={addRod}><Plus className="w-4 h-4" /></Button>
                            <Button size="sm" onClick={() => console.log("Save Plan", rods)}><Save className="w-4 h-4" /></Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">#</TableHead>
                                <TableHead>Len (ft)</TableHead>
                                <TableHead>Pitch (°)</TableHead>
                                <TableHead>Azimuth</TableHead>
                                <TableHead className="w-[40px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rods.map((rod, i) => (
                                <TableRow key={rod.id}>
                                    <TableCell>{i + 1}</TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={rod.length}
                                            onChange={(e) => updateRod(i, 'length', parseFloat(e.target.value))}
                                            className="h-8 w-16"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={rod.pitch}
                                            onChange={(e) => updateRod(i, 'pitch', parseFloat(e.target.value))}
                                            className="h-8 w-16"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={rod.azimuth}
                                            onChange={(e) => updateRod(i, 'azimuth', parseFloat(e.target.value))}
                                            className="h-8 w-16"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeRod(i)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Right: 3D Visualization */}
            <Card className="lg:col-span-2 flex flex-col h-full overflow-hidden">
                <CardHeader className="pb-2 flex flex-row justify-between items-center">
                    <CardTitle>3D Preview</CardTitle>
                    <div className="flex items-center gap-4">
                        {collisionResult?.hasCollision && (
                            <div className="flex items-center text-red-600 animate-pulse font-bold">
                                <AlertTriangle className="w-5 h-5 mr-2" />
                                COLLISION DETECTED
                            </div>
                        )}
                        {collisionResult?.riskLevel === 'WARNING' && (
                            <div className="flex items-center text-orange-500 font-bold">
                                <AlertTriangle className="w-5 h-5 mr-2" />
                                PROXIMITY WARNING
                            </div>
                        )}
                        {isCalculating && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                    </div>
                </CardHeader>
                <CardContent className="flex-1 p-0 relative min-h-[400px]">
                    <Borehole3D
                        stations={calculatedPath}
                        ghostPath={[]}
                        viewMode="iso"
                        obstacles={obstacles} // Pass obstacles to 3D view
                    />

                    {/* Collision Warnings Overlay */}
                    {collisionResult && collisionResult.warnings.length > 0 && (
                        <div className="absolute bottom-4 left-4 right-4 bg-black/80 text-white p-4 rounded-md max-h-[150px] overflow-y-auto z-10">
                            <h4 className="font-bold mb-2 text-sm uppercase tracking-wider">Safety Alerts</h4>
                            <ul className="space-y-1 text-sm">
                                {collisionResult.warnings.map((w, i) => (
                                    <li key={i} className={w.includes('CRITICAL') ? 'text-red-400' : 'text-orange-300'}>
                                        {w}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
