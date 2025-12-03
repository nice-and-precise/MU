'use client';

import React from 'react';
import DrillPath3D from '@/components/visualization/DrillPath3D';
import MudMixer from '@/components/tools/MudMixer';
import AutoLogUploader from '@/components/tools/AutoLogUploader';

export default function DrillingDashboard() {
    return (
        <div className="min-h-screen bg-black text-white font-mono p-4">
            <header className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                <div>
                    <h1 className="text-3xl font-black text-emerald-400 tracking-tighter">MU <span className="text-white">DRILLOS</span></h1>
                    <p className="text-xs text-gray-500">LIVE OPERATION: RIG-042</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <div className="text-xs text-gray-400">BIT DEPTH</div>
                        <div className="text-2xl font-bold text-sky-400">4,250 <span className="text-sm">ft</span></div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-gray-400">ROP</div>
                        <div className="text-2xl font-bold text-emerald-400">125 <span className="text-sm">ft/hr</span></div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: 3D View & Telemetry */}
                <div className="lg:col-span-2 space-y-6">
                    <DrillPath3D />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Widget label="HOLE DEPTH" value="4,250" unit="ft" color="text-white" />
                        <Widget label="BIT DEPTH" value="4,248" unit="ft" color="text-white" />
                        <Widget label="WOB" value="15.2" unit="klb" color="text-emerald-400" />
                        <Widget label="TORQUE" value="8.5" unit="kft-lb" color="text-emerald-400" />
                        <Widget label="RPM" value="120" unit="rpm" color="text-white" />
                        <Widget label="FLOW IN" value="450" unit="gpm" color="text-blue-400" />
                        <Widget label="SPP" value="2,850" unit="psi" color="text-red-500" warning />
                        <Widget label="ECD" value="9.8" unit="ppg" color="text-yellow-400" />
                    </div>
                </div>

                {/* Right Column: Tools & Advisor */}
                <div className="space-y-6">
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                        <h3 className="text-emerald-400 font-bold mb-2">DRILLING ADVISOR</h3>
                        <p className="text-sm text-gray-300 mb-4">
                            Monitoring parameters. No immediate hazards detected.
                            Target slide: 15ft @ 240° Toolface.
                        </p>
                        <button className="w-full py-2 bg-gray-800 border border-emerald-400 text-emerald-400 rounded hover:bg-gray-700 uppercase tracking-wider font-bold">
                            View Analysis
                        </button>
                    </div>

                    <MudMixer />
                    <AutoLogUploader />
                </div>
            </div>
        </div>
    );
}

function Widget({ label, value, unit, color, warning = false }: { label: string, value: string, unit: string, color: string, warning?: boolean }) {
    return (
        <div className={`bg-gray-900 p-4 rounded-lg border ${warning ? 'border-red-500 animate-pulse' : 'border-gray-800'}`}>
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className={`text-2xl font-bold ${color}`}>
                {value} <span className="text-sm text-gray-600">{unit}</span>
            </div>
        </div>
    );
}
