"use client";

import { useState, useEffect } from "react";
import { logRodPass, getLastRodPass } from "@/app/actions/rod-pass";
import { Loader2, ArrowRight, History, CheckCircle2 } from "lucide-react";

export default function RodPassForm({ bores }: { bores: any[] }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [selectedBoreId, setSelectedBoreId] = useState("");
    const [lastPass, setLastPass] = useState<any>(null);
    const [sequence, setSequence] = useState(1);

    useEffect(() => {
        if (selectedBoreId) {
            fetchLastPass(selectedBoreId);
        } else {
            setLastPass(null);
            setSequence(1);
        }
    }, [selectedBoreId]);

    async function fetchLastPass(boreId: string) {
        const pass = await getLastRodPass(boreId);
        setLastPass(pass);
        if (pass) {
            setSequence(pass.sequence + 1);
        } else {
            setSequence(1);
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        const formData = new FormData(e.currentTarget);
        try {
            const res = await logRodPass(formData);
            if (res.success) {
                setSuccess(true);
                (e.target as HTMLFormElement).reset();
                // Refresh last pass data immediately
                if (res.data) {
                    setLastPass(res.data);
                    setSequence(res.data.sequence + 1);
                }
                // Reset select value manually if needed, but we want to keep the bore selected
                // Just clear the inputs that aren't sticky
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            // Hide success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    {success && (
                        <div className="flex items-center bg-green-50 text-green-700 p-4 rounded-lg text-sm mb-4 border border-green-200 animate-in fade-in slide-in-from-top-2">
                            <CheckCircle2 className="h-5 w-5 mr-2" />
                            Rod pass logged successfully!
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Bore</label>
                        <select
                            name="boreId"
                            required
                            value={selectedBoreId}
                            onChange={(e) => setSelectedBoreId(e.target.value)}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2.5"
                        >
                            <option value="">-- Choose Active Bore --</option>
                            {bores.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name} ({b.project?.name || 'Unknown Project'})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rod Sequence #</label>
                            <input
                                type="number"
                                name="sequence"
                                required
                                value={sequence}
                                onChange={(e) => setSequence(parseInt(e.target.value))}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2.5 font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Length (LF)</label>
                            <input
                                type="number"
                                name="linearFeet"
                                defaultValue={10} // Standard rod length
                                required
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2.5"
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                            Telemetry Data
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Pitch (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="pitch"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2"
                                    placeholder="0.0"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Azimuth (°)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="azimuth"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2"
                                    placeholder="0.0"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Depth (ft)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="depth"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2"
                                    placeholder="0.0"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                            Detailed Reporting
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Viscosity (sec)</label>
                                <input
                                    type="number"
                                    step="1"
                                    name="viscosity"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2"
                                    placeholder="45"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Mud Wt (lb/gal)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="mudWeight"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2"
                                    placeholder="8.4"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tool Face (°)</label>
                                <input
                                    type="number"
                                    step="1"
                                    name="steeringToolFace"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2"
                                    placeholder="0-360"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Reamer (in)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="reamerDiameter"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2"
                                    placeholder="Optional"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                        <textarea
                            name="notes"
                            rows={3}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2.5"
                            placeholder="Soil conditions, steering adjustments..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !selectedBoreId}
                        className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                            <>
                                Log Rod Pass <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Context Sidebar */}
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                        <History className="h-5 w-5 mr-2 text-gray-400" />
                        Previous Rod
                    </h3>

                    {lastPass ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-sm text-gray-500">Sequence</span>
                                <span className="font-mono font-bold text-gray-900 dark:text-white">#{lastPass.sequence}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Pitch</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{lastPass.pitch ?? '-'}%</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Azimuth</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{lastPass.azimuth ?? '-'}°</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Depth</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{lastPass.depth ?? '-'} ft</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Length</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{lastPass.linearFeet} ft</p>
                                </div>
                                {lastPass.viscosity && (
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Visc / Mud</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{lastPass.viscosity}s / {lastPass.mudWeight}lb</p>
                                    </div>
                                )}
                                {lastPass.steeringToolFace !== null && (
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Tool Face</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{lastPass.steeringToolFace}°</p>
                                    </div>
                                )}
                            </div>
                            {lastPass.notes && (
                                <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{lastPass.notes}"</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p className="text-sm">No previous passes found.</p>
                            <p className="text-xs mt-1">Select a bore to see history.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
