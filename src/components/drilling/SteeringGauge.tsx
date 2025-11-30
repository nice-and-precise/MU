import React from 'react';

interface SteeringGaugeProps {
    toolface: number; // 0-360
    targetToolface?: number;
}

export default function SteeringGauge({ toolface, targetToolface }: SteeringGaugeProps) {
    // Convert degrees to radians for SVG math
    // SVG coords: 0 deg is usually 3 o'clock (0 rad).
    // Drilling Toolface: 0 deg is 12 o'clock (Magnetic North / High Side).
    // So we need to rotate by -90 deg.

    const radius = 80;
    const center = 100;

    const getCoord = (deg: number, r: number) => {
        const rad = (deg - 90) * (Math.PI / 180);
        return {
            x: center + r * Math.cos(rad),
            y: center + r * Math.sin(rad),
        };
    };

    const tfPos = getCoord(toolface, radius - 10);

    return (
        <div className="flex flex-col items-center">
            <svg width="200" height="200" viewBox="0 0 200 200">
                {/* Background Circle */}
                <circle cx={center} cy={center} r={radius} stroke="#333" strokeWidth="4" fill="#1e1e1e" />

                {/* Ticks */}
                {[0, 90, 180, 270].map((deg) => {
                    const p1 = getCoord(deg, radius);
                    const p2 = getCoord(deg, radius - 10);
                    return (
                        <line
                            key={deg}
                            x1={p1.x}
                            y1={p1.y}
                            x2={p2.x}
                            y2={p2.y}
                            stroke="#666"
                            strokeWidth="2"
                        />
                    );
                })}

                {/* Target Toolface Marker */}
                {targetToolface !== undefined && (
                    <line
                        x1={center}
                        y1={center}
                        x2={getCoord(targetToolface, radius).x}
                        y2={getCoord(targetToolface, radius).y}
                        stroke="lime"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                    />
                )}

                {/* Current Toolface Needle */}
                <line
                    x1={center}
                    y1={center}
                    x2={tfPos.x}
                    y2={tfPos.y}
                    stroke="cyan"
                    strokeWidth="4"
                    strokeLinecap="round"
                />

                {/* Center Hub */}
                <circle cx={center} cy={center} r="5" fill="#333" />
            </svg>
            <div className="mt-2 text-xl font-mono font-bold text-cyan-400">
                {toolface.toFixed(1)}°
            </div>
        </div>
    );
}
