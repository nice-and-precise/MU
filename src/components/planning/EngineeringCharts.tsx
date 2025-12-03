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
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

interface EngineeringChartsProps {
    data: {
        md: number;
        pullback: number;
        pMax: number;
        tvd: number;
    }[];
}

export default function EngineeringCharts({ data }: EngineeringChartsProps) {
    const labels = data.map(d => Math.round(d.md));

    const pullbackData = {
        labels,
        datasets: [
            {
                label: 'Estimated Pullback Force (lbs)',
                data: data.map(d => d.pullback),
                borderColor: '#FF6700', // Brand Secondary (Orange)
                backgroundColor: 'rgba(255, 103, 0, 0.2)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const pressureData = {
        labels,
        datasets: [
            {
                label: 'Formation Limit (P_max) (psi)',
                data: data.map(d => d.pMax),
                borderColor: '#2A2A2A', // Brand Primary (Charcoal)
                backgroundColor: 'rgba(42, 42, 42, 0.1)',
                borderDash: [5, 5],
                fill: false,
                tension: 0.1,
            },
            {
                label: 'Annular Pressure (Est) (psi)',
                // Simple estimation: Hydrostatic (0.052 * 9ppg * TVD) + Friction (simplified)
                data: data.map(d => (0.052 * 9.0 * d.tvd) + (d.md * 0.01)),
                borderColor: '#4A90E2', // Brand Accent (Blue)
                backgroundColor: 'rgba(74, 144, 226, 0.2)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    font: { family: 'Inter' }
                }
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                titleFont: { family: 'Oswald' },
                bodyFont: { family: 'Inter' }
            },
        },
        scales: {
            x: {
                title: { display: true, text: 'Measured Depth (ft)' },
                grid: { display: false }
            },
            y: {
                beginAtZero: true,
                grid: { color: '#f0f0f0' }
            }
        },
        interaction: {
            mode: 'nearest' as const,
            axis: 'x' as const,
            intersect: false
        }
    };

    return (
        <div className="grid grid-cols-1 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-heading text-lg">Pullback Force Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <Line options={{ ...options, scales: { ...options.scales, y: { ...options.scales.y, title: { display: true, text: 'Force (lbs)' } } } }} data={pullbackData} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-heading text-lg">Hydraulic Pressure Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <Line options={{ ...options, scales: { ...options.scales, y: { ...options.scales.y, title: { display: true, text: 'Pressure (psi)' } } } }} data={pressureData} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
