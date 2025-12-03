'use client';

import React, { useState } from 'react';

export default function MudMixer() {
    const [volume, setVolume] = useState(500); // gallons
    const [soilType, setSoilType] = useState('clay');
    const [advice, setAdvice] = useState('');
    const [loading, setLoading] = useState(false);

    const calculateMix = () => {
        // Basic rule of thumb calculation
        let bentonite = 0;
        let polymer = 0;

        if (soilType === 'clay') {
            bentonite = (volume / 100) * 1.5; // bags
            polymer = (volume / 100) * 0.5; // jugs
        } else if (soilType === 'sand') {
            bentonite = (volume / 100) * 2.5;
            polymer = (volume / 100) * 1.0;
        } else {
            bentonite = (volume / 100) * 2.0;
            polymer = (volume / 100) * 0.2;
        }

        return { bentonite, polymer };
    };

    const mix = calculateMix();

    const optimizeWithAI = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/ai/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `Optimize mud mix for ${volume} gallons in ${soilType} soil. Current plan: ${mix.bentonite} bags bentonite, ${mix.polymer} jugs polymer.`,
                    context: {
                        depth: 0,
                        pressure: 0,
                        soilType: soilType,
                        bhaConfig: 'N/A'
                    }
                })
            });
            const data = await res.json();
            setAdvice(data.answer);
        } catch (e) {
            console.error(e);
            setAdvice("Failed to get AI advice.");
        }
        setLoading(false);
    };

    return (
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-700 shadow-2xl">
            <h2 className="text-2xl font-bold text-emerald-400 mb-6">Mud Mixing Calculator</h2>

            <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-gray-400 mb-2">Target Volume (gal)</label>
                    <input
                        type="number"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-full bg-black border border-gray-600 rounded p-2 text-white focus:border-neon-green outline-none"
                    />
                </div>
                <div>
                    <label className="block text-gray-400 mb-2">Soil Type</label>
                    <select
                        value={soilType}
                        onChange={(e) => setSoilType(e.target.value)}
                        className="w-full bg-black border border-gray-600 rounded p-2 text-white focus:border-neon-green outline-none"
                    >
                        <option value="clay">Clay</option>
                        <option value="sand">Sand</option>
                        <option value="rock">Rock</option>
                        <option value="cobble">Cobble</option>
                    </select>
                </div>
            </div>

            <div className="bg-black p-4 rounded-lg border border-gray-800 mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Recommended Mix</h3>
                <div className="flex justify-between text-gray-300">
                    <span>Bentonite (50lb bags):</span>
                    <span className="font-bold text-sky-400">{mix.bentonite.toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                    <span>Polymer (jugs):</span>
                    <span className="font-bold text-sky-400">{mix.polymer.toFixed(1)}</span>
                </div>
            </div>

            <button
                onClick={optimizeWithAI}
                disabled={loading}
                className="w-full py-3 bg-blue-900 text-white font-bold rounded hover:bg-blue-800 transition-colors uppercase tracking-wider"
            >
                {loading ? 'CALCULATING...' : 'CALCULATE OPTIMAL MIX'}
            </button>

            {advice && (
                <div className="mt-6 p-4 bg-gray-800 rounded border-l-4 border-emerald-500 text-sm text-gray-300 whitespace-pre-wrap font-mono">
                    <strong className="block text-white mb-2">ADVISOR OUTPUT:</strong>
                    {advice}
                </div>
            )}
        </div>
    );
}
