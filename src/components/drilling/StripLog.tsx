"use client";

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { SurveyStation } from '../../lib/drilling/types';

interface StripLogProps {
    data: SurveyStation[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-800 text-white p-3 rounded shadow-lg text-xs font-mono z-50">
                <p className="font-bold border-b border-slate-600 mb-1 pb-1">MD: {label} ft</p>
                <p>Inc: {data.inc.toFixed(2)}°</p>
                <p>Azi: {data.azi.toFixed(2)}°</p>
                <p className="text-slate-400 mt-1">TVD: {data.tvd.toFixed(1)}</p>
                <p className="text-slate-400">N/S: {data.north.toFixed(1)}</p>
                <p className="text-slate-400">E/W: {data.east.toFixed(1)}</p>
                <p className="text-amber-400 mt-1">DLS: {data.dls?.toFixed(2)}</p>
            </div>
        );
    }
    return null;
};

export default function StripLog({ data }: StripLogProps) {
    return (
        <div className="h-full w-full bg-white flex flex-col">
            {/* Header */}
            <div className="p-3 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800 text-sm">Strip Log</h3>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Track 1: Inclination */}
                <div className="flex-1 border-r border-slate-100 relative">
                    <div className="absolute top-2 left-2 z-10 bg-white/80 px-2 py-1 rounded text-xs font-bold text-purple-600">
                        Inclination (0-90°)
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            layout="vertical"
                            data={data}
                            margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                            <XAxis type="number" domain={[0, 90]} hide />
                            <YAxis dataKey="md" type="number" reversed={true} width={40} tick={{ fontSize: 10 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <ReferenceLine x={90} stroke="#cbd5e1" strokeDasharray="3 3" label={{ value: 'Horiz', position: 'insideTopRight', fontSize: 10, fill: '#94a3b8' }} />
                            <Line type="monotone" dataKey="inc" stroke="#9333ea" strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Track 2: Azimuth */}
                <div className="flex-1 relative">
                    <div className="absolute top-2 left-2 z-10 bg-white/80 px-2 py-1 rounded text-xs font-bold text-emerald-600">
                        Azimuth (0-360°)
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            layout="vertical"
                            data={data}
                            margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                            <XAxis type="number" domain={[0, 360]} hide />
                            <YAxis dataKey="md" type="number" reversed={true} hide />
                            <Tooltip content={<CustomTooltip />} />
                            <ReferenceLine x={0} stroke="#cbd5e1" />
                            <ReferenceLine x={90} stroke="#f1f5f9" />
                            <ReferenceLine x={180} stroke="#f1f5f9" />
                            <ReferenceLine x={270} stroke="#f1f5f9" />
                            <ReferenceLine x={360} stroke="#cbd5e1" />
                            <Line type="monotone" dataKey="azi" stroke="#059669" strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
