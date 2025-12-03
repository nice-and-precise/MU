"use client";

import { useEffect, useRef, useState } from "react";

export default function SubterraCanvas() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [wasmModule, setWasmModule] = useState<any>(null);
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const initWasm = async () => {
            try {
                console.log("Initializing Subterra Cognitive Interface...");

                // Dynamic import of the WASM module
                // @ts-ignore
                const module = await import("@/subterra-wasm/subterra.js");
                await module.default(); // init

                try {
                    module.run_app();
                } catch (e: any) {
                    // Bevy/Winit throws an exception to break control flow on web. This is expected.
                    if (!e.message.includes("Using exceptions for control flow")) {
                        throw e;
                    }
                }

                setWasmModule(module);
                setIsLoading(false);
            } catch (err) {
                console.error("Failed to load Subterra WASM:", err);
                // Don't show error to user in mock mode, just log it
                setIsLoading(false);
            }
        };

        initWasm();
    }, []);

    const triggerScenario = (id: number) => {
        if (wasmModule) {
            wasmModule.set_scenario(id);
        }
    };

    return (
        <div className="relative w-full h-full min-h-[600px] bg-black rounded-lg overflow-hidden border-2 border-slate-800 group">
            <canvas
                id="subterra-canvas"
                className="w-full h-full block"
                onContextMenu={(e) => e.preventDefault()}
            />

            {/* UI Overlays */}
            <div className="absolute top-4 left-4 p-4 bg-black/50 backdrop-blur-md rounded border border-green-500/30 text-green-400 font-mono text-sm pointer-events-none select-none">
                <h3 className="text-lg font-bold mb-2">DRILL TELEMETRY</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-xs text-gray-400">TORQUE</div>
                        <div className="text-xl">2,450 <span className="text-xs">ft-lb</span></div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-400">RPM</div>
                        <div className="text-xl">128 <span className="text-xs">rpm</span></div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-400">THRUST</div>
                        <div className="text-xl">1,500 <span className="text-xs">psi</span></div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-400">DEPTH</div>
                        <div className="text-xl">45.2 <span className="text-xs">ft</span></div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-4 right-4 p-2 bg-black/70 rounded text-xs text-gray-500 pointer-events-none select-none">
                SUBTERRA ENGINE v0.1.0-alpha
            </div>

            {/* Demo Controls - Visible on Hover */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                <div className="bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg shadow-xl">
                    <h4 className="text-xs font-bold text-white mb-2 uppercase tracking-wider">Simulation Injection</h4>
                    <div className="space-y-2">
                        <button
                            onClick={() => triggerScenario(0)}
                            className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded transition-colors border border-transparent hover:border-slate-600"
                        >
                            🟢 Normal Operation
                        </button>
                        <button
                            onClick={() => triggerScenario(1)}
                            className="w-full text-left px-3 py-1.5 text-xs text-red-300 hover:bg-red-900/30 rounded transition-colors border border-transparent hover:border-red-800"
                        >
                            🔴 Hard Rock Strike
                        </button>
                        <button
                            onClick={() => triggerScenario(2)}
                            className="w-full text-left px-3 py-1.5 text-xs text-yellow-300 hover:bg-yellow-900/30 rounded transition-colors border border-transparent hover:border-yellow-800"
                        >
                            ⚠️ Fluid Loss / Void
                        </button>
                        <button
                            onClick={() => triggerScenario(3)}
                            className="w-full text-left px-3 py-1.5 text-xs text-blue-300 hover:bg-blue-900/30 rounded transition-colors border border-transparent hover:border-blue-800"
                        >
                            🔵 Steering Deviation
                        </button>
                    </div>
                </div>
            </div>

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
                    <div className="text-green-500 font-mono animate-pulse">
                        INITIALIZING VOXEL ENGINE...
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50">
                    <div className="text-red-500 font-mono border border-red-500 p-4 rounded">
                        ERROR: {error}
                    </div>
                </div>
            )}
        </div>
    );
}
