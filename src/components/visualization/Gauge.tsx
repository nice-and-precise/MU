"use client";

import React from "react";

interface GaugeProps {
    value: number;
    min: number;
    max: number;
    label: string;
    unit: string;
    color?: string;
}

export function Gauge({ value, min, max, label, unit, color = "#3b82f6" }: GaugeProps) {
    // Calculate rotation
    const range = max - min;
    const normalizedValue = Math.min(Math.max(value, min), max);
    const percentage = (normalizedValue - min) / range;
    const rotation = -90 + (percentage * 180); // -90 to 90 degrees

    return (
        <div className="relative w-32 h-24 flex flex-col items-center justify-end">
            {/* Gauge Arc Background */}
            <div className="absolute top-0 w-32 h-16 overflow-hidden">
                <div className="w-32 h-32 rounded-full border-[12px] border-slate-700 box-border"></div>
            </div>

            {/* Gauge Arc Value */}
            <div className="absolute top-0 w-32 h-16 overflow-hidden">
                <div
                    className="w-32 h-32 rounded-full border-[12px] border-transparent border-t-current box-border transition-all duration-500 ease-out"
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        borderColor: color,
                        borderRightColor: 'transparent',
                        borderBottomColor: 'transparent',
                        borderLeftColor: 'transparent'
                    }}
                ></div>
            </div>

            {/* Needle (Simplified as a value display for now to avoid complex SVG math) */}
            <div className="z-10 text-center mt-8">
                <div className="text-2xl font-bold text-white" style={{ textShadow: `0 0 10px ${color}` }}>
                    {value.toFixed(1)}
                </div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{label}</div>
                <div className="text-[10px] text-slate-500">{unit}</div>
            </div>
        </div>
    );
}
