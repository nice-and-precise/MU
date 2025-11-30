"use client";

import React from 'react';
import { Camera, Map, Box, Play, Pause } from 'lucide-react';

interface BoreholeControlsProps {
    viewMode: 'iso' | 'top' | 'side';
    flyThrough: boolean;
    onViewChange: (mode: 'iso' | 'top' | 'side') => void;
    onFlyThroughToggle: () => void;
}

export default function BoreholeControls({ viewMode, flyThrough, onViewChange, onFlyThroughToggle }: BoreholeControlsProps) {
    return (
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <div className="bg-white/90 backdrop-blur shadow-sm rounded-lg p-1 flex flex-col gap-1">
                <button
                    onClick={() => onViewChange('iso')}
                    className={`p-2 rounded hover:bg-slate-100 transition-colors ${viewMode === 'iso' ? 'bg-blue-100 text-blue-600' : 'text-slate-600'}`}
                    title="3D View"
                >
                    <Box size={20} />
                </button>
                <button
                    onClick={() => onViewChange('top')}
                    className={`p-2 rounded hover:bg-slate-100 transition-colors ${viewMode === 'top' ? 'bg-blue-100 text-blue-600' : 'text-slate-600'}`}
                    title="Top View (Map)"
                >
                    <Map size={20} />
                </button>
                <button
                    onClick={() => onViewChange('side')}
                    className={`p-2 rounded hover:bg-slate-100 transition-colors ${viewMode === 'side' ? 'bg-blue-100 text-blue-600' : 'text-slate-600'}`}
                    title="Side View (Section)"
                >
                    <Camera size={20} />
                </button>
            </div>

            <div className="bg-white/90 backdrop-blur shadow-sm rounded-lg p-1">
                <button
                    onClick={onFlyThroughToggle}
                    className={`p-2 rounded hover:bg-slate-100 transition-colors w-full flex justify-center ${flyThrough ? 'bg-red-100 text-red-600' : 'text-green-600'}`}
                    title={flyThrough ? "Stop Fly-Through" : "Start Fly-Through"}
                >
                    {flyThrough ? <Pause size={20} /> : <Play size={20} />}
                </button>
            </div>
        </div>
    );
}
