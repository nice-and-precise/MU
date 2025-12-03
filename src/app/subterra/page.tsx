"use client";

import SubterraCanvas from "@/components/SubterraCanvas";
import { useState } from "react";

export default function SubterraPage() {
    const [showTour, setShowTour] = useState(true);

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-white p-6">
            <header className="mb-6 flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                        COGNITIVE SUBSURFACE INTERFACE
                    </h1>
                    <p className="text-slate-400 text-sm">Voxel-based HDD Telemetry & Visualization</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-3 py-1 bg-green-900/30 border border-green-500/50 rounded text-green-400 text-xs font-mono flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                        SYSTEM ONLINE
                    </div>
                    <div className="px-3 py-1 bg-blue-900/30 border border-blue-500/50 rounded text-blue-400 text-xs font-mono">
                        MODE: SIMULATION
                    </div>
                </div>
            </header>

            <main className="flex-1 min-h-0 flex gap-6 relative">
                {/* Main Visualization */}
                <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 p-1 shadow-2xl overflow-hidden relative group">
                    <SubterraCanvas />

                    {/* Tour Overlay */}
                    {showTour && (
                        <div className="absolute inset-0 bg-black/60 z-40 flex items-center justify-center backdrop-blur-sm">
                            <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl max-w-2xl shadow-2xl">
                                <h2 className="text-2xl font-bold text-white mb-4">Welcome to Subterra</h2>
                                <p className="text-slate-300 mb-6 leading-relaxed">
                                    This is a <strong>Cognitive Interface</strong> for Horizontal Directional Drilling.
                                    It visualizes the subsurface environment in real-time using a Voxel engine.
                                </p>

                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                        <div className="text-green-400 font-bold mb-2">🔭 Voxel Visualization</div>
                                        <p className="text-xs text-slate-400">See the soil composition (Clay vs. Rock) before you hit it. Opacity changes based on density.</p>
                                    </div>
                                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                        <div className="text-blue-400 font-bold mb-2">🎮 Gamified Feedback</div>
                                        <p className="text-xs text-slate-400">The "Ghost Bit" glows green when on target. Sparks and camera shake indicate high-MSE events (rock strikes).</p>
                                    </div>
                                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                        <div className="text-yellow-400 font-bold mb-2">⚠️ Anomaly Detection</div>
                                        <p className="text-xs text-slate-400">AI monitors torque/pressure variance to predict failures before they happen.</p>
                                    </div>
                                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                        <div className="text-purple-400 font-bold mb-2">🧪 Simulation Mode</div>
                                        <p className="text-xs text-slate-400">Hover over the top-right corner of the canvas to inject fault scenarios (Rock Strike, Void, etc.).</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowTour(false)}
                                    className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors"
                                >
                                    ENTER INTERFACE
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Controls (Mock) */}
                <div className="w-80 flex flex-col gap-4">
                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                        <h3 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">Drill Parameters</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">Target Depth</label>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div className="bg-blue-500 h-full w-[45%]"></div>
                                </div>
                                <div className="flex justify-between text-xs mt-1">
                                    <span className="text-white">45.2 ft</span>
                                    <span className="text-slate-500">100 ft</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-slate-800 p-2 rounded border border-slate-700">
                                    <div className="text-[10px] text-slate-500">PITCH</div>
                                    <div className="text-lg font-mono text-white">-12°</div>
                                </div>
                                <div className="bg-slate-800 p-2 rounded border border-slate-700">
                                    <div className="text-[10px] text-slate-500">ROLL</div>
                                    <div className="text-lg font-mono text-white">45°</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex-1">
                        <h3 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">Lithology Prediction</h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-slate-700/50">
                                <div className="w-3 h-3 bg-yellow-600 rounded-sm"></div>
                                <div className="text-xs text-slate-300 flex-1">Clay / Silt</div>
                                <div className="text-xs font-mono text-slate-500">0-30m</div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-slate-700/50">
                                <div className="w-3 h-3 bg-red-800 rounded-sm"></div>
                                <div className="text-xs text-slate-300 flex-1">Granite (Hard)</div>
                                <div className="text-xs font-mono text-slate-500">30-50m</div>
                            </div>

                            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded">
                                <div className="text-xs text-red-400 font-bold mb-1 flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    ANOMALY DETECTED
                                </div>
                                <p className="text-[10px] text-red-300/80 leading-tight">
                                    High torque variance detected at 45.2ft. Possible rock obstruction or steering difficulty.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
