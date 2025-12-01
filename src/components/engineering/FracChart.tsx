'use client';

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
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface FracChartProps {
    data: {
        depth: number;
        hydrostatic: number;
        pReq: number;
        pMax: number;
    }[];
}

export default function FracChart({ data }: FracChartProps) {
    const chartData = {
        datasets: [
            {
                label: 'Fracture Limit (P_max)',
                data: data.map(d => ({ x: d.pMax, y: d.depth })),
                borderColor: 'rgb(239, 68, 68)', // Red
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: false,
                tension: 0.4
            },
            {
                label: 'Annular Pressure (P_req)',
                data: data.map(d => ({ x: d.pReq, y: d.depth })),
                borderColor: 'rgb(59, 130, 246)', // Blue
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: false,
                tension: 0.4
            },
            {
                label: 'Hydrostatic Head',
                data: data.map(d => ({ x: d.hydrostatic, y: d.depth })),
                borderColor: 'rgb(107, 114, 128)', // Gray
                borderDash: [5, 5],
                fill: false,
                tension: 0.4
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y' as const, // Vertical depth chart
        scales: {
            y: {
                reverse: true, // Depth increases downwards
                title: {
                    display: true,
                    text: 'Depth (ft)'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Pressure (psi)'
                },
                beginAtZero: true
            }
        },
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Downhole Pressure Analysis'
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        return `${context.dataset.label}: ${Math.round(context.raw.x)} psi @ ${context.raw.y} ft`;
                    }
                }
            }
        }
    };

    return <Line options={options} data={chartData} />;
}
