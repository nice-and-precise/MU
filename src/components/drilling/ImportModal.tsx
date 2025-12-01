"use client";

import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { parseWitsmlTrajectory } from '../../lib/drilling/witsml/parser';
import { calculateTrajectory } from '../../lib/drilling/math/mcm';
import { SurveyStation } from '../../lib/drilling/types';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (stations: SurveyStation[]) => void;
}

export default function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const parseCSV = (text: string): { md: number, inc: number, azi: number }[] => {
        const lines = text.split('\n');
        const data: { md: number, inc: number, azi: number }[] = [];

        // Simple heuristic to find header row or start of data
        // We expect columns: MD, Inc, Azi (in that order roughly, or by name)

        let headerFound = false;
        let mdIdx = 0, incIdx = 1, aziIdx = 2;

        for (let line of lines) {
            const parts = line.split(',').map(p => p.trim());
            if (parts.length < 3) continue;

            // Try to detect headers
            if (!headerFound) {
                const lower = parts.map(p => p.toLowerCase());
                if (lower.some(p => p.includes('md') || p.includes('depth'))) {
                    mdIdx = lower.findIndex(p => p.includes('md') || p.includes('depth'));
                    incIdx = lower.findIndex(p => p.includes('inc') || p.includes('dip'));
                    aziIdx = lower.findIndex(p => p.includes('azi') || p.includes('dir'));
                    headerFound = true;
                    continue;
                }
                // If first line looks like numbers, assume it's data (0,1,2)
                if (!isNaN(parseFloat(parts[0]))) {
                    headerFound = true;
                    // Fallthrough to parse
                } else {
                    continue; // Skip unknown header/metadata
                }
            }

            const md = parseFloat(parts[mdIdx]);
            const inc = parseFloat(parts[incIdx]);
            const azi = parseFloat(parts[aziIdx]);

            if (!isNaN(md) && !isNaN(inc) && !isNaN(azi)) {
                data.push({ md, inc, azi });
            }
        }
        return data;
    };

    const processFile = async (file: File) => {
        setError(null);
        setSuccess(null);

        try {
            const text = await file.text();
            let rawPoints: { md: number, inc: number, azi: number }[] = [];

            if (file.name.toLowerCase().endsWith('.xml')) {
                const witsmlStations = await parseWitsmlTrajectory(text);
                if (witsmlStations.length === 0) throw new Error("No valid stations found in WITSML file.");
                rawPoints = witsmlStations.map(s => ({ md: s.md, inc: s.incl, azi: s.azi }));
            } else if (file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.txt')) {
                rawPoints = parseCSV(text);
                if (rawPoints.length === 0) throw new Error("No valid data found in CSV file.");
            } else {
                throw new Error("Unsupported file format. Please use .xml (WITSML) or .csv");
            }

            // Calculate full trajectory
            const trajectory = calculateTrajectory(rawPoints);
            setSuccess(`Successfully parsed ${trajectory.length} stations.`);

            // Short delay to show success before closing
            setTimeout(() => {
                onImport(trajectory);
                onClose();
                setSuccess(null);
            }, 1000);

        } catch (err: any) {
            setError(err.message || "Failed to parse file.");
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            processFile(file);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-slate-900 mb-2">Import Survey</h2>
                <p className="text-slate-500 text-sm mb-6">
                    Upload a WITSML (.xml) or CSV file to load trajectory data.
                </p>

                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
            border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors
            ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}
            ${success ? 'border-green-500 bg-green-50' : ''}
            ${error ? 'border-red-500 bg-red-50' : ''}
          `}
                >
                    {success ? (
                        <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                    ) : error ? (
                        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    ) : (
                        <Upload className="w-12 h-12 text-slate-400 mb-4" />
                    )}

                    <div className="space-y-2">
                        {success ? (
                            <p className="text-green-700 font-medium">{success}</p>
                        ) : error ? (
                            <p className="text-red-600 font-medium">{error}</p>
                        ) : (
                            <>
                                <p className="text-slate-700 font-medium">
                                    Drag & Drop file here
                                </p>
                                <p className="text-slate-400 text-xs">
                                    or
                                </p>
                                <label className="inline-block">
                                    <span className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-indigo-500 transition-colors">
                                        Browse Files
                                    </span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".xml,.csv,.txt"
                                        onChange={handleFileSelect}
                                    />
                                </label>
                            </>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <FileText className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div className="text-xs text-slate-500">
                        <p className="font-medium text-slate-700 mb-1">Supported Formats:</p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li><strong>WITSML 1.4.1</strong> (.xml) - Standard industry format</li>
                            <li><strong>CSV</strong> (.csv) - Columns: MD, Inc, Azi</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
