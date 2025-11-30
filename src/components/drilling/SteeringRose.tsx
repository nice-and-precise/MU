"use client";

import React from 'react';

interface SteeringRoseProps {
    toolFace: number; // 0-360
    pitch: number; // degrees
    azimuth: number; // 0-360
    targetToolFace?: number;
}

export default function SteeringRose({ toolFace, pitch, azimuth, targetToolFace }: SteeringRoseProps) {
    // Calculate rotation for the needle
    const needleRotation = toolFace;

    return (
        <div className="relative w-64 h-64 flex items-center justify-center bg-slate-900 rounded-full border-4 border-slate-700 shadow-2xl">
            {/* Compass Rose Background */}
            <div className="absolute inset-0 rounded-full border-2 border-slate-600 opacity-50"></div>

            {/* Ticks */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <div
                    key={deg}
                    className="absolute w-full h-full flex justify-center"
                    style={{ transform: `rotate(${deg}deg)` }}
                >
                    <div className={`w-1 ${deg % 90 === 0 ? 'h-4 bg-slate-400' : 'h-2 bg-slate-600'}`}></div>
                </div>
            ))}

            {/* Labels */}
            <div className="absolute top-2 text-slate-400 font-bold">12</div>
            <div className="absolute bottom-2 text-slate-400 font-bold">6</div>
            <div className="absolute left-3 text-slate-400 font-bold">9</div>
            <div className="absolute right-3 text-slate-400 font-bold">3</div>

            {/* Target Indicator (Ghost Needle) */}
            {targetToolFace !== undefined && (
                <div
                    className="absolute w-full h-full flex justify-center items-start transition-transform duration-500"
                    style={{ transform: `rotate(${targetToolFace}deg)` }}
                >
                    <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[16px] border-b-green-500/50 mt-4"></div>
                </div>
            )}

            {/* Tool Face Needle */}
            <div
                className="absolute w-full h-full flex justify-center items-start transition-transform duration-300 ease-out"
                style={{ transform: `rotate(${needleRotation}deg)` }}
            >
                {/* Needle Head */}
                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[20px] border-b-orange-500 mt-2 drop-shadow-lg"></div>
            </div>

            {/* Center Info Hub */}
            <div className="absolute w-32 h-32 bg-slate-800 rounded-full flex flex-col items-center justify-center border-2 border-slate-600 z-10">
                <div className="text-xs text-slate-400 uppercase tracking-wider">Pitch</div>
                <div className="text-2xl font-bold text-white">{pitch.toFixed(1)}°</div>
                <div className="w-16 h-[1px] bg-slate-600 my-1"></div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">TF</div>
                <div className="text-xl font-bold text-orange-400">{Math.round(toolFace)}°</div>
            </div>
        </div>
    );
}
