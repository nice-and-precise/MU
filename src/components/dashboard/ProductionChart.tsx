"use client";

import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top' as const,
            labels: {
                font: {
                    family: 'Inter',
                },
                color: '#2A2A2A', // Charcoal
            },
        },
        title: {
            display: false,
        },
        tooltip: {
            backgroundColor: '#2A2A2A',
            titleFont: { family: 'Oswald' },
            bodyFont: { family: 'Inter' },
            padding: 12,
            cornerRadius: 8,
        },
    },
    scales: {
        x: {
            grid: {
                display: false,
            },
            ticks: {
                font: { family: 'Inter' },
                color: '#6b7280',
            },
        },
        y: {
            grid: {
                color: '#e5e7eb',
            },
            ticks: {
                font: { family: 'Inter' },
                color: '#6b7280',
            },
        },
    },
};

const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
        {
            label: 'Footage Drilled (ft)',
            data: [400, 300, 200, 278, 189, 239, 349],
            backgroundColor: '#FF6700', // Safety Orange (Secondary)
            borderRadius: 4,
        },
        {
            label: 'Revenue ($)',
            data: [2400, 1398, 9800, 3908, 4800, 3800, 4300],
            backgroundColor: '#2A2A2A', // Charcoal (Primary)
            borderRadius: 4,
        },
    ],
};

export function ProductionChart() {
    return (
        <div className="h-[300px] w-full p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <Bar options={options} data={data} />
        </div>
    );
}
