"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import Borehole3D from '../drilling/Borehole3D';
import { SurveyStation } from '@/lib/drilling/types';
import { calculatePathWithRust } from '@/lib/api/engine';

// Simple types for the planner
interface PlannedRod {
    id: string;
    length: number; // ft
    pitch: number; // degrees (slope)
    azimuth: number; // degrees (compass)
}

export default function RodPlanningGrid() {
    const [rods, setRods] = useState<PlannedRod[]>([
        { id: '1', length: 15, pitch: -12, azimuth: 90 } // Entry rod
    ]);
    const [calculatedPath, setCalculatedPath] = useState<SurveyStation[]>([]);
    const [isCalculating, setIsCalculating] = useState(false);

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
                // Rust engine expects survey points.
                // If we send just the rod ends, it will calculate from there.
                // Let's ensure we have a start point.
                if (inputs.length > 0 && inputs[0].md > 0) {
                    inputs.unshift({ md: 0, pitch: 0, az: rods[0].azimuth });
                }

                const result = await calculatePathWithRust(inputs);
                setCalculatedPath(result);
            } catch (error) {
                console.error("Calculation failed", error);
            } finally {
                setIsCalculating(false);
            }
        };

        const debounce = setTimeout(calculate, 500);
        return () => clearTimeout(debounce);
    }, [rods]);

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
                    {isCalculating && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                </CardHeader>
                <CardContent className="flex-1 p-0 relative min-h-[400px]">
                    <Borehole3D
                        stations={calculatedPath}
                        ghostPath={[]} // Could show actual vs plan here later
                        viewMode="iso"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
