"use client";

import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { SurveyStation } from '../../lib/drilling/types';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface StripLogProps {
    data: SurveyStation[];
}

export default function StripLog({ data }: StripLogProps) {
    const commonOptions = {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'linear' as const,
                position: 'top' as const,
            },
            y: {
                type: 'linear' as const,
                reverse: true,
                title: { display: false },
                grid: {
                    display: true,
                },
                border: {
                    display: false
                }
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const val = context.raw.x;
                        return `${val.toFixed(2)}°`;
                    }
                }
            }
        },
        elements: {
            point: {
                radius: 0
            }
        }
    };

    const incOptions = {
        ...commonOptions,
        scales: {
            ...commonOptions.scales,
            x: {
                ...commonOptions.scales.x,
                min: 0,
                max: 90,
            }
        }
    };

    const aziOptions = {
        ...commonOptions,
        scales: {
            ...commonOptions.scales,
            x: {
                ...commonOptions.scales.x,
                min: 0,
                max: 360,
            }
        }
    };

    const incData = {
        datasets: [
            {
                label: 'Inclination',
                data: data.map(d => ({ x: d.inc, y: d.md })),
                borderColor: '#9333ea',
                borderWidth: 2,
                tension: 0.1,
            },
        ],
    };

    const aziData = {
        datasets: [
            {
                label: 'Azimuth',
                data: data.map(d => ({ x: d.azi, y: d.md })),
                borderColor: '#059669',
                borderWidth: 2,
                tension: 0.1,
            },
        ],
    };

    return (
        <div className="h-full w-full bg-white flex flex-col">
            {/* Header */}
            <div className="p-3 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800 text-sm">Strip Log</h3>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Track 1: Inclination */}
                <div className="flex-1 border-r border-slate-100 relative p-2">
                    <div className="absolute top-2 left-2 z-10 bg-white/80 px-2 py-1 rounded text-xs font-bold text-purple-600">
                        Inclination (0-90°)
                    </div>
                    <div className="h-full w-full pt-6">
                        <Line options={incOptions} data={incData} />
                    </div>
                </div>

                {/* Track 2: Azimuth */}
                <div className="flex-1 relative p-2">
                    <div className="absolute top-2 left-2 z-10 bg-white/80 px-2 py-1 rounded text-xs font-bold text-emerald-600">
                        Azimuth (0-360°)
                    </div>
                    <div className="h-full w-full pt-6">
                        <Line options={aziOptions} data={aziData} />
                    </div>
                </div>
            </div>
        </div>
    );
}
