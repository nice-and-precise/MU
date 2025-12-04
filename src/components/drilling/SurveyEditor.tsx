"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { SurveyStation } from '../../lib/drilling/types';

interface SurveyPoint {
    md: number;
    inc: number;
    azi: number;
}

interface SurveyEditorProps {
    stations: SurveyStation[]; // Calculated stations to show results
    onUpdate: (points: SurveyPoint[]) => void;
}

export default function SurveyEditor({ stations, onUpdate }: SurveyEditorProps) {
    // We maintain local state for the inputs to allow typing before committing?
    // Actually, let's just derive from props for now, or use a local "draft" state.
    // To keep it simple, we'll map stations back to points.

    const [points, setPoints] = useState<SurveyPoint[]>([]);

    useEffect(() => {
        if (stations.length > 0) {
            setPoints(stations.map(s => ({ md: s.md, inc: s.inc, azi: s.azi })));
        } else if (points.length === 0) {
            // Initialize with tie-in if empty
            setPoints([{ md: 0, inc: 0, azi: 0 }]);
        }
    }, [stations]);

    const handleChange = (index: number, field: keyof SurveyPoint, value: string) => {
        const newPoints = [...points];
        newPoints[index] = { ...newPoints[index], [field]: parseFloat(value) || 0 };
        setPoints(newPoints);
        onUpdate(newPoints);
    };

    const handleAddRow = () => {
        const last = points[points.length - 1];
        const newPoints = [...points, { md: last.md + 30, inc: last.inc, azi: last.azi }];
        setPoints(newPoints);
        onUpdate(newPoints);
    };

    const handleDeleteRow = (index: number) => {
        if (points.length <= 1) return; // Don't delete tie-in
        const newPoints = points.filter((_, i) => i !== index);
        setPoints(newPoints);
        onUpdate(newPoints);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden flex flex-col h-full dark:border dark:border-slate-800">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800">Survey Editor</h3>
                <button
                    onClick={handleAddRow}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                    <Plus size={16} />
                    Add Station
                </button>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3">MD (ft)</th>
                            <th className="px-4 py-3">Inc (°)</th>
                            <th className="px-4 py-3">Azi (°)</th>
                            <th className="px-4 py-3 text-slate-400">TVD</th>
                            <th className="px-4 py-3 text-slate-400">N/S</th>
                            <th className="px-4 py-3 text-slate-400">E/W</th>
                            <th className="px-4 py-3 text-slate-400">DLS</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {points.map((point, i) => {
                            const result = stations[i]; // Corresponding calculated result
                            const isHighDLS = result?.dls && result.dls > 3.0;

                            return (
                                <tr key={i} className="hover:bg-slate-50 group">
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            value={point.md}
                                            onChange={(e) => handleChange(i, 'md', e.target.value)}
                                            className="w-20 px-2 py-1 border border-slate-200 rounded focus:outline-none focus:border-blue-500 font-mono"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            value={point.inc}
                                            onChange={(e) => handleChange(i, 'inc', e.target.value)}
                                            className="w-16 px-2 py-1 border border-slate-200 rounded focus:outline-none focus:border-blue-500 font-mono"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            value={point.azi}
                                            onChange={(e) => handleChange(i, 'azi', e.target.value)}
                                            className="w-16 px-2 py-1 border border-slate-200 rounded focus:outline-none focus:border-blue-500 font-mono"
                                        />
                                    </td>

                                    {/* Calculated Results (Read Only) */}
                                    <td className="px-4 py-2 text-slate-600 font-mono">{result?.tvd.toFixed(1) || '-'}</td>
                                    <td className="px-4 py-2 text-slate-600 font-mono">{result?.north.toFixed(1) || '-'}</td>
                                    <td className="px-4 py-2 text-slate-600 font-mono">{result?.east.toFixed(1) || '-'}</td>
                                    <td className={`px-4 py-2 font-mono font-bold flex items-center gap-1 ${isHighDLS ? 'text-amber-600' : 'text-slate-400'}`}>
                                        {result?.dls?.toFixed(2) || '0.00'}
                                        {isHighDLS && <AlertTriangle size={12} />}
                                    </td>

                                    <td className="px-2 py-2 text-right">
                                        {i > 0 && (
                                            <button
                                                onClick={() => handleDeleteRow(i)}
                                                className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
