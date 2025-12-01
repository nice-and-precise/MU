import React from 'react';

interface SteeringRoseProps {
    toolface: number; // 0-360
    targetToolface?: number; // 0-360
    pitch: number;
    azimuth: number;
    dayMode?: boolean;
}

export default function SteeringRose({ toolface, targetToolface, pitch, azimuth, dayMode = false }: SteeringRoseProps) {
    // Colors
    const bgColor = dayMode ? "bg-white" : "bg-slate-900";
    const circleColor = dayMode ? "stroke-gray-300" : "stroke-slate-700";
    const textColor = dayMode ? "fill-gray-900" : "fill-white";
    const needleColor = "stroke-orange-500";
    const targetColor = "stroke-green-500";

    // Convert toolface to rotation (0 is usually Top/High Side)
    // SVG rotation: 0 is right (3 o'clock). We want 0 at top (12 o'clock).
    // So rotate -90 deg.
    // Toolface 0 = High Side.
    const needleRotation = toolface - 90;
    const targetRotation = (targetToolface ?? 0) - 90;

    return (
        <div className={`relative w-full aspect-square ${bgColor} rounded-full flex items-center justify-center p-2`}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Outer Ring */}
                <circle cx="50" cy="50" r="45" fill="none" strokeWidth="2" className={circleColor} />

                {/* Ticks */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                    <line
                        key={deg}
                        x1="50" y1="50"
                        x2={50 + 40 * Math.cos((deg - 90) * Math.PI / 180)}
                        y2={50 + 40 * Math.sin((deg - 90) * Math.PI / 180)}
                        stroke="currentColor"
                        strokeWidth={deg % 90 === 0 ? "2" : "1"}
                        className={dayMode ? "text-gray-400" : "text-slate-600"}
                    />
                ))}

                {/* Labels */}
                <text x="50" y="15" textAnchor="middle" className={`text-[8px] font-bold ${textColor}`}>HS</text>
                <text x="85" y="52" textAnchor="middle" className={`text-[8px] font-bold ${textColor}`}>R</text>
                <text x="50" y="90" textAnchor="middle" className={`text-[8px] font-bold ${textColor}`}>LS</text>
                <text x="15" y="52" textAnchor="middle" className={`text-[8px] font-bold ${textColor}`}>L</text>

                {/* Target Needle */}
                {targetToolface !== undefined && (
                    <g transform={`rotate(${targetRotation} 50 50)`}>
                        <line x1="50" y1="50" x2="85" y2="50" className={targetColor} strokeWidth="3" strokeDasharray="4 2" />
                    </g>
                )}

                {/* Actual Needle */}
                <g transform={`rotate(${needleRotation} 50 50)`}>
                    {/* Pointer */}
                    <path d="M 50 50 L 85 50" className={needleColor} strokeWidth="4" />
                    {/* Arrowhead */}
                    <path d="M 85 50 L 75 45 L 75 55 Z" fill="orange" />
                </g>

                {/* Center Hub */}
                <circle cx="50" cy="50" r="5" className={dayMode ? "fill-gray-900" : "fill-slate-200"} />
            </svg>

            {/* Digital Readout Overlay */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-center">
                <div className={`text-xs font-mono ${dayMode ? "text-gray-500" : "text-slate-400"}`}>TF</div>
                <div className={`text-lg font-bold ${dayMode ? "text-gray-900" : "text-white"}`}>{toolface.toFixed(1)}°</div>
            </div>
        </div>
    );
}
