"use client";

import React from 'react';

interface SteeringRoseProps {
    toolFace: number; // 0-360
    pitch: number; // degrees
    azimuth: number; // 0-360
    targetToolFace?: number;
    status?: 'normal' | 'warning' | 'critical'; // Traffic Light System
    highContrast?: boolean; // Day Mode
}

export default function SteeringRose({
    toolFace,
    pitch,
    azimuth,
    targetToolFace,
    status = 'normal',
    highContrast = false
}: SteeringRoseProps) {
    // Calculate rotation for the needle
    const needleRotation = toolFace;

    // Traffic Light Colors
    const statusColors = {
        normal: highContrast ? 'bg-green-600' : 'bg-green-500',
        warning: highContrast ? 'bg-yellow-600' : 'bg-yellow-500',
        critical: highContrast ? 'bg-red-600' : 'bg-red-500',
    };

    const statusBorder = {
        normal: highContrast ? 'border-green-800' : 'border-green-500/50',
        warning: highContrast ? 'border-yellow-800' : 'border-yellow-500/50',
        critical: highContrast ? 'border-red-800' : 'border-red-500/50',
    };

    // High Contrast Styles
    const bgClass = highContrast ? 'bg-[#FFD700]' : 'bg-slate-900';
    const borderClass = highContrast ? 'border-black' : 'border-slate-700';
    const textClass = highContrast ? 'text-black' : 'text-slate-400';
    const needleClass = highContrast ? 'border-b-black' : 'border-b-orange-500';
    const ghostClass = highContrast ? 'border-b-gray-600' : 'border-b-green-500/50';
    const centerBg = highContrast ? 'bg-white' : 'bg-slate-800';
    const centerText = highContrast ? 'text-black' : 'text-white';

    return (
        <div className={`relative w-64 h-64 flex items-center justify-center rounded-full border-4 shadow-2xl transition-colors duration-300 ${bgClass} ${borderClass} ${statusBorder[status]}`}>
            {/* Compass Rose Background */}
            <div className={`absolute inset-0 rounded-full border-2 opacity-50 ${highContrast ? 'border-black' : 'border-slate-600'}`}></div>

            {/* Traffic Light Halo (Pulse if critical) */}
            {status === 'critical' && (
                <div className="absolute inset-0 rounded-full bg-red-500/20 animate-pulse"></div>
            )}

            {/* Ticks */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <div
                    key={deg}
                    className="absolute w-full h-full flex justify-center"
                    style={{ transform: `rotate(${deg}deg)` }}
                >
                    <div className={`w-1 ${deg % 90 === 0 ? (highContrast ? 'h-4 bg-black' : 'h-4 bg-slate-400') : (highContrast ? 'h-2 bg-black' : 'h-2 bg-slate-600')}`}></div>
                </div>
            ))}

            {/* Labels */}
            <div className={`absolute top-2 font-bold ${textClass}`}>12</div>
            <div className={`absolute bottom-2 font-bold ${textClass}`}>6</div>
            <div className={`absolute left-3 font-bold ${textClass}`}>9</div>
            <div className={`absolute right-3 font-bold ${textClass}`}>3</div>

            {/* Target Indicator (Ghost Needle) */}
            {targetToolFace !== undefined && (
                <div
                    className="absolute w-full h-full flex justify-center items-start transition-transform duration-500"
                    style={{ transform: `rotate(${targetToolFace}deg)` }}
                >
                    <div className={`w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[16px] mt-4 ${ghostClass}`}></div>
                </div>
            )}

            {/* Tool Face Needle */}
            <div
                className="absolute w-full h-full flex justify-center items-start transition-transform duration-300 ease-out"
                style={{ transform: `rotate(${needleRotation}deg)` }}
            >
                {/* Needle Head */}
                <div className={`w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[20px] mt-2 drop-shadow-lg ${needleClass}`}></div>
            </div>

            {/* Center Info Hub */}
            <div className={`absolute w-32 h-32 rounded-full flex flex-col items-center justify-center border-2 z-10 ${centerBg} ${highContrast ? 'border-black' : 'border-slate-600'}`}>
                <div className={`text-xs uppercase tracking-wider ${textClass}`}>Pitch</div>
                <div className={`text-2xl font-bold ${centerText}`}>{pitch.toFixed(1)}°</div>
                <div className={`w-16 h-[1px] my-1 ${highContrast ? 'bg-black' : 'bg-slate-600'}`}></div>
                <div className={`text-xs uppercase tracking-wider ${textClass}`}>TF</div>
                <div className={`text-xl font-bold ${highContrast ? 'text-black' : 'text-orange-400'}`}>{Math.round(toolFace)}°</div>

                {/* Status Indicator Dot */}
                <div className={`mt-1 w-3 h-3 rounded-full ${statusColors[status]}`}></div>
            </div>
        </div>
    );
}
