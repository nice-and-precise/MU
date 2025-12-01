"use client";

import React, { useState, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Calculator, ArrowRight, Compass } from 'lucide-react';
import { generateRodPlan } from '../../lib/drilling/math/planning';
import { RodPlanInput, RodPlanStep, SurveyStation } from '../../lib/drilling/types';
import { calculateDetailedPullback } from '../../lib/drilling/math/loads';
import { calculateDelftPMax, getSoilProperties } from '../../lib/drilling/math/hydraulics';
import { calculateTrueAzimuth } from '../../lib/drilling/math/magnetic';

interface RodPlannerProps {
    onPlanGenerated: (ghostPath: SurveyStation[]) => void;
}

export default function RodPlanner({ onPlanGenerated }: RodPlannerProps) {
    const [input, setInput] = useState<RodPlanInput & {
        diameter: number;
        material: 'HDPE' | 'Steel';
        soil: 'Clay' | 'Sand' | 'Rock';
        declination: number;
    }>({
        targetDepth: 50,
        targetDistance: 500,
        entryAngle: 12, // degrees down
        rodLength: 15, // ft
        maxBend: 4, // deg/rod
        diameter: 4,
        material: 'HDPE',
        soil: 'Clay',
        declination: 0
    });

    const [plan, setPlan] = useState<(RodPlanStep & { pullback: number; pMax: number })[]>([]);

    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: plan.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 35, // Approximate row height
        overscan: 5,
    });

    const handleCalculate = () => {
        const steps = generateRodPlan(input);

        // Physics Calculations
        const layerInput = { soilType: input.soil, startDepth: 0, endDepth: 10000 };

        // We need a trajectory for pullback calculation (requires full path history)
        // Initial Station
        const physicsPath: SurveyStation[] = [];

        // Add initial station (Entry Point)
        physicsPath.push({
            md: 0,
            inc: input.entryAngle,
            azi: calculateTrueAzimuth(90, input.declination), // True Azimuth
            tvd: 0,
            north: 0,
            east: 0,
            dls: 0
        });

        // Calculate Physics for each step
        const enrichedSteps = steps.map((step, i) => {
            // Update physicsPath for this step
            // For 2D planner, we assume constant azimuth (East = 90)
            // But we apply declination to the "True" azimuth
            const trueAzimuth = calculateTrueAzimuth(90, input.declination);

            physicsPath.push({
                md: step.md,
                inc: 90 + step.pitch, // Convert Pitch to Inc (90 is horizontal)
                azi: trueAzimuth,
                tvd: step.depth,
                north: 0, // Simplified 2D
                east: step.distance, // Simplified 2D
                dls: 0
            });

            // Pullback: Calculate for the path up to this point
            const pullback = calculateDetailedPullback(
                physicsPath, // Use the accumulated path
                input.diameter,
                input.material,
                input.soil
            );

            // P_max (Delft)
            const stepSoilProps = getSoilProperties(layerInput, step.depth);
            const pMax = calculateDelftPMax(step.depth, stepSoilProps);

            return { ...step, pullback, pMax };
        });

        setPlan(enrichedSteps);

        // Convert to SurveyStations for 3D visualization (Ghost Path)
        const ghostPath: SurveyStation[] = enrichedSteps.map(step => ({
            md: step.md,
            inc: 90 + step.pitch,
            azi: calculateTrueAzimuth(90, input.declination),
            tvd: step.depth,
            north: 0,
            east: step.distance,
            dls: 0
        }));

        onPlanGenerated(ghostPath);
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-slate-700">
                <Calculator size={20} />
                <h2 className="font-bold text-lg">Rod Planner</h2>
            </div>

            <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Depth (ft)</label>
                        <input
                            type="number"
                            value={input.targetDepth}
                            onChange={e => setInput({ ...input, targetDepth: Number(e.target.value) })}
                            className="w-full p-2 border border-slate-300 rounded font-mono text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Dist (ft)</label>
                        <input
                            type="number"
                            value={input.targetDistance}
                            onChange={e => setInput({ ...input, targetDistance: Number(e.target.value) })}
                            className="w-full p-2 border border-slate-300 rounded font-mono text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Entry Angle (°)</label>
                        <input
                            type="number"
                            value={input.entryAngle}
                            onChange={e => setInput({ ...input, entryAngle: Number(e.target.value) })}
                            className="w-full p-2 border border-slate-300 rounded font-mono text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rod Len (ft)</label>
                        <input
                            type="number"
                            value={input.rodLength}
                            onChange={e => setInput({ ...input, rodLength: Number(e.target.value) })}
                            className="w-full p-2 border border-slate-300 rounded font-mono text-sm"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Steer Rate (°)</label>
                    <input
                        type="number"
                        value={input.maxBend}
                        onChange={e => setInput({ ...input, maxBend: Number(e.target.value) })}
                        className="w-full p-2 border border-slate-300 rounded font-mono text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Diameter (in)</label>
                    <input
                        type="number"
                        value={input.diameter}
                        onChange={e => setInput({ ...input, diameter: Number(e.target.value) })}
                        className="w-full p-2 border border-slate-300 rounded font-mono text-sm"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Material</label>
                    <select
                        value={input.material}
                        onChange={e => setInput({ ...input, material: e.target.value as any })}
                        className="w-full p-2 border border-slate-300 rounded font-mono text-sm"
                    >
                        <option value="HDPE">HDPE</option>
                        <option value="Steel">Steel</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Soil</label>
                    <select
                        value={input.soil}
                        onChange={e => setInput({ ...input, soil: e.target.value as any })}
                        className="w-full p-2 border border-slate-300 rounded font-mono text-sm"
                    >
                        <option value="Clay">Clay</option>
                        <option value="Sand">Sand</option>
                        <option value="Rock">Rock</option>
                    </select>
                </div>
            </div>

            {/* Magnetic Declination */}
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                    <Compass size={14} className="text-slate-500" />
                    <label className="text-xs font-bold text-slate-500 uppercase">Mag Declination (°)</label>
                </div>
                <div className="flex gap-2 items-center">
                    <input
                        type="number"
                        value={input.declination}
                        onChange={e => setInput({ ...input, declination: Number(e.target.value) })}
                        className="w-full p-2 border border-slate-300 rounded font-mono text-sm"
                        placeholder="e.g. -5.2"
                    />
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                        {input.declination > 0 ? 'East (+)' : input.declination < 0 ? 'West (-)' : 'None'}
                    </span>
                </div>
            </div>

            <button
                onClick={handleCalculate}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
            >
                Generate Plan <ArrowRight size={16} />
            </button>


            {/* Results Table */}
            <div className="flex-1 overflow-hidden border rounded-lg flex flex-col">
                <div className="bg-slate-50 text-slate-500 flex text-xs font-bold uppercase tracking-wider border-b">
                    <div className="p-2 w-1/6">Rod</div>
                    <div className="p-2 w-1/6">Pitch</div>
                    <div className="p-2 w-1/6">Depth</div>
                    <div className="p-2 w-1/6">Pullback</div>
                    <div className="p-2 w-1/6">P_max</div>
                    <div className="p-2 w-1/6">Action</div>
                </div>
                <div ref={parentRef} className="flex-1 overflow-y-auto">
                    <div
                        style={{
                            height: `${rowVirtualizer.getTotalSize()}px`,
                            width: '100%',
                            position: 'relative',
                        }}
                    >
                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                            const row = plan[virtualRow.index];
                            return (
                                <div
                                    key={row.rodNumber}
                                    className="absolute top-0 left-0 w-full flex text-xs border-b last:border-0 hover:bg-slate-50"
                                    style={{
                                        height: `${virtualRow.size}px`,
                                        transform: `translateY(${virtualRow.start}px)`,
                                    }}
                                >
                                    <div className="p-2 w-1/6 font-mono">{row.rodNumber}</div>
                                    <div className="p-2 w-1/6 font-mono">{row.pitch.toFixed(1)}°</div>
                                    <div className="p-2 w-1/6 font-mono">{row.depth.toFixed(1)}'</div>
                                    <div className="p-2 w-1/6 font-mono text-blue-600 font-bold">{Math.round(row.pullback).toLocaleString()} lbs</div>
                                    <div className="p-2 w-1/6 font-mono text-purple-600 font-bold">{Math.round(row.pMax).toLocaleString()} psi</div>
                                    <div className={`p-2 w-1/6 font-bold ${row.action.includes('Steer') ? 'text-orange-600' : 'text-slate-600'}`}>
                                        {row.action}
                                    </div>
                                </div>
                            );
                        })}
                        {plan.length === 0 && (
                            <div className="p-8 text-center text-slate-400 italic">
                                No plan generated yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
