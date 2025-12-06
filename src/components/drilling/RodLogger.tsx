'use client';

import { useState } from 'react';
import { addRodPass } from '@/actions/drilling';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ArrowDown, ArrowUp, Send, History } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LiveTelemetry from './LiveTelemetry';

interface RodLoggerProps {
    bore: any;
}

export default function RodLogger({ bore }: RodLoggerProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [pitch, setPitch] = useState('');
    const [azimuth, setAzimuth] = useState('');
    const [length, setLength] = useState('15'); // Default 15ft rod

    const lastPass = bore.rodPasses[bore.rodPasses.length - 1];
    const totalLength = bore.rodPasses.reduce((acc: number, r: any) => acc + r.linearFeet, 0);
    const currentDepth = lastPass?.depth || 0;

    const handleSubmit = async () => {
        if (!pitch || !length) return;
        setLoading(true);

        const res = await addRodPass({
            boreId: bore.id,
            length: Number(length),
            pitch: Number(pitch),
            azimuth: Number(azimuth) || (lastPass?.azimuth || 0), // Default to last azimuth if empty
        });

        if (res.success) {
            setPitch('');
            // Keep length and azimuth as they often don't change much
            router.refresh();
        } else {
            alert('Failed to log rod');
        }
        setLoading(false);
    };

    const handleCopyValues = (p: number, a: number) => {
        setPitch(p.toFixed(1));
        setAzimuth(a.toFixed(1));
    };

    return (
        <div className="max-w-md mx-auto space-y-4">

            {/* Live Data HUD */}
            <LiveTelemetry boreId={bore.id} onCopyValues={handleCopyValues} />

            {/* HUD */}
            <div className="grid grid-cols-3 gap-2 text-center">
                <Card className="bg-slate-900 text-white border-none">
                    <CardContent className="p-3">
                        <div className="text-xs text-slate-400 uppercase">Rod #</div>
                        <div className="text-2xl font-bold font-mono">{(lastPass?.sequence || 0) + 1}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 text-white border-none">
                    <CardContent className="p-3">
                        <div className="text-xs text-slate-400 uppercase">Depth</div>
                        <div className="text-2xl font-bold font-mono">{currentDepth.toFixed(1)}'</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 text-white border-none">
                    <CardContent className="p-3">
                        <div className="text-xs text-slate-400 uppercase">Dist</div>
                        <div className="text-2xl font-bold font-mono">{totalLength.toFixed(0)}'</div>
                    </CardContent>
                </Card>
            </div>

            {/* Input Form */}
            <Card className="border-2 border-blue-100 shadow-lg">
                <CardContent className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Pitch (%)</label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                value={pitch}
                                onChange={e => setPitch(e.target.value)}
                                placeholder="0.0"
                                className="text-3xl h-16 font-mono text-center"
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-center gap-4 mt-2">
                            <Button variant="outline" size="sm" onClick={() => setPitch((Number(pitch) - 1).toString())}>-1%</Button>
                            <Button variant="outline" size="sm" onClick={() => setPitch((Number(pitch) + 1).toString())}>+1%</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Azimuth (°)</label>
                            <Input
                                type="number"
                                value={azimuth}
                                onChange={e => setAzimuth(e.target.value)}
                                placeholder={lastPass?.azimuth?.toString() || "0"}
                                className="text-xl h-12 font-mono text-center"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Length (ft)</label>
                            <Input
                                type="number"
                                value={length}
                                onChange={e => setLength(e.target.value)}
                                className="text-xl h-12 font-mono text-center"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !pitch}
                        className="w-full h-16 text-lg bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2" />}
                        LOG SHOT
                    </Button>
                </CardContent>
            </Card>

            {/* Recent History */}
            <Card>
                <CardContent className="p-0">
                    <div className="bg-slate-50 p-2 border-b flex items-center gap-2 text-sm font-medium text-slate-600">
                        <History className="w-4 h-4" /> Recent Rods
                    </div>
                    <div className="divide-y">
                        {[...bore.rodPasses].reverse().slice(0, 5).map((rod: any) => (
                            <div key={rod.id} className="flex justify-between p-3 text-sm">
                                <span className="font-mono font-bold text-slate-500">#{rod.sequence}</span>
                                <span className="font-mono">{rod.pitch}% / {rod.azimuth}°</span>
                                <span className="font-mono text-slate-400">{rod.depth.toFixed(1)}' D</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
