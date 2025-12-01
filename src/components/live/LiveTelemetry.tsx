'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { simulateDrillingData } from '@/app/actions/simulate';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, ArrowUp, ArrowDown, Play, RefreshCw } from 'lucide-react';

interface TelemetryLog {
    depth: number;
    pitch: number;
    azimuth: number;
    timestamp: string;
}

interface LiveTelemetryProps {
    boreId: string;
    boreName: string;
}

export function LiveTelemetry({ boreId, boreName }: LiveTelemetryProps) {
    const [data, setData] = useState<TelemetryLog | null>(null);
    const [history, setHistory] = useState<TelemetryLog[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/witsml/latest?boreId=${boreId}`);
            if (res.ok) {
                const log = await res.json();
                if (log) {
                    setData(log);
                    setLastUpdated(new Date());

                    // Add to history if it's new
                    setHistory(prev => {
                        if (prev.length > 0 && prev[prev.length - 1].timestamp === log.timestamp) {
                            return prev;
                        }
                        const newHistory = [...prev, log].slice(-20); // Keep last 20 points
                        return newHistory;
                    });
                }
            }
        } catch (error) {
            console.error("Failed to fetch telemetry", error);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchData();

        // Poll every 5 seconds
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [boreId]);

    const handleSimulate = async () => {
        setIsSimulating(true);
        await simulateDrillingData(boreId);
        await fetchData(); // Immediate update
        setIsSimulating(false);
    };

    return (
        <div className="space-y-6">
            {/* HUD Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-900 text-white border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Bit Depth</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-blue-400">
                            {data?.depth.toFixed(2) || "0.00"} <span className="text-lg text-slate-500">ft</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 text-white border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Pitch / Inc</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            <div className="text-4xl font-bold text-yellow-400">
                                {data?.pitch.toFixed(2) || "0.00"}°
                            </div>
                            {data && data.pitch > 0 ? <ArrowUp className="text-green-500" /> : <ArrowDown className="text-red-500" />}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 text-white border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Azimuth</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-purple-400">
                            {data?.azimuth.toFixed(2) || "0.00"}°
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Controls & Status */}
            <div className="flex justify-between items-center bg-slate-100 p-4 rounded-lg dark:bg-slate-800">
                <div className="flex items-center space-x-4">
                    <Button onClick={handleSimulate} disabled={isSimulating} className="bg-blue-600 hover:bg-blue-700">
                        {isSimulating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                        Simulate Data Packet
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Last Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
                    </span>
                </div>
                <div className="text-sm font-mono text-slate-500">
                    BORE: {boreName}
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Pitch Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="depth" label={{ value: 'Depth (ft)', position: 'insideBottom', offset: -5 }} />
                                <YAxis domain={['auto', 'auto']} />
                                <Tooltip />
                                <Line type="monotone" dataKey="pitch" stroke="#fbbf24" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Azimuth Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="depth" label={{ value: 'Depth (ft)', position: 'insideBottom', offset: -5 }} />
                                <YAxis domain={['auto', 'auto']} />
                                <Tooltip />
                                <Line type="monotone" dataKey="azimuth" stroke="#c084fc" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
