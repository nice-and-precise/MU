"use client";

import React, { useState } from 'react';
import { Calculator, ArrowRight } from 'lucide-react';
import { generateRodPlan } from '../../lib/drilling/math/planning';
import { RodPlanInput, RodPlanStep, SurveyStation } from '../../lib/drilling/types';

interface RodPlannerProps {
    onPlanGenerated: (ghostPath: SurveyStation[]) => void;
}

export default function RodPlanner({ onPlanGenerated }: RodPlannerProps) {
    const [input, setInput] = useState<RodPlanInput>({
        targetDepth: 50,
        entryAngle: 12, // degrees down
        rodLength: 15, // ft
        maxBend: 4, // deg/rod
    });

    const [plan, setPlan] = useState<RodPlanStep[]>([]);

    const handleCalculate = () => {
        const steps = generateRodPlan(input);
        setPlan(steps);

        // Convert to SurveyStations for 3D visualization (Ghost Path)
        // Assuming Azimuth 90 (East) for simplicity of 2D profile
        const ghostPath: SurveyStation[] = steps.map(step => ({
            md: step.md,
            inc: 90 + step.pitch, // HDD Pitch 0 = Horizontal (Inc 90). Pitch +12 (Down) = Inc 102? 
            // Wait, usually HDD Pitch + is UP? 
            // Let's stick to: Pitch 0 = Horizontal. + is UP, - is DOWN.
            // But my planner logic said: "currentPitch > 0 ... pointing down".
            // So Pitch + is DOWN.
            // Inc = 90 + Pitch? (0 -> 90, 10 -> 100). Yes.
            // If Pitch is -10 (Up), Inc = 80.
            azi: 90, // East
            tvd: step.depth,
            north: 0,
            east: step.distance,
            dls: 0 // approximate
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
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Depth (ft)</label>
                    <input
                        type="number"
                        value={input.targetDepth}
                        onChange={e => setInput({ ...input, targetDepth: Number(e.target.value) })}
                        className="w-full p-2 border border-slate-300 rounded font-mono text-sm"
                    />
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
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Steer Rate (°/rod)</label>
                    <input
                        type="number"
                        value={input.maxBend}
                        onChange={e => setInput({ ...input, maxBend: Number(e.target.value) })}
                        className="w-full p-2 border border-slate-300 rounded font-mono text-sm"
                    />
                </div>

                <button
                    onClick={handleCalculate}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                >
                    Generate Plan <ArrowRight size={16} />
                </button>
            </div>

            {/* Results Table */}
            <div className="flex-1 overflow-auto border rounded-lg">
                <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 sticky top-0">
                        <tr>
                            <th className="p-2 border-b">Rod</th>
                            <th className="p-2 border-b">Pitch</th>
                            <th className="p-2 border-b">Depth</th>
                            <th className="p-2 border-b">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plan.map((row) => (
                            <tr key={row.rodNumber} className="border-b last:border-0 hover:bg-slate-50">
                                <td className="p-2 font-mono">{row.rodNumber}</td>
                                <td className="p-2 font-mono">{row.pitch.toFixed(1)}°</td>
                                <td className="p-2 font-mono">{row.depth.toFixed(1)}</td>
                                <td className={`p-2 font-bold ${row.action.includes('Steer') ? 'text-orange-600' : 'text-slate-600'
                                    }`}>
                                    {row.action}
                                </td>
                            </tr>
                        ))}
                        {plan.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-400 italic">
                                    No plan generated yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
