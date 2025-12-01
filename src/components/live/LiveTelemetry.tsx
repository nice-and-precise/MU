'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { simulateDrillingData } from '@/app/actions/simulate';
import { Activity, ArrowUp, ArrowDown, Play, RefreshCw } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

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
        // Initial fetch via SSE
        const eventSource = new EventSource(`/api/witsml/stream?boreId=${boreId}`);

        eventSource.onmessage = (event) => {
            try {
                const log = JSON.parse(event.data);
                if (log) {
                    setData(log);
                    setLastUpdated(new Date());

                    setHistory(prev => {
                        if (prev.length > 0 && prev[prev.length - 1].timestamp === log.timestamp) {
                            return prev;
                        }
                        const newHistory = [...prev, log].slice(-20);
                        return newHistory;
                    });
                }
            } catch (e) {
                console.error("Error parsing SSE data", e);
            }
        };

        eventSource.onerror = (err) => {
            console.error("SSE Error:", err);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [boreId]);

    const handleSimulate = async () => {
        setIsSimulating(true);
        await simulateDrillingData(boreId);
        await fetchData(); // Immediate update
        setIsSimulating(false);
    };

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'linear' as const,
                title: { display: true, text: 'Depth (ft)' },
            },
            y: {
                title: { display: true, text: 'Degrees' },
            }
        },
        plugins: {
            legend: { display: false },
        }
    };

    const pitchData = {
        datasets: [
            {
                label: 'Pitch',
                data: history.map(h => ({ x: h.depth, y: h.pitch })),
                borderColor: '#fbbf24',
                backgroundColor: '#fbbf24',
                tension: 0.1,
            },
        ],
    };

    const azimuthData = {
        datasets: [
            {
                label: 'Azimuth',
                data: history.map(h => ({ x: h.depth, y: h.azimuth })),
                borderColor: '#c084fc',
                backgroundColor: '#c084fc',
                tension: 0.1,
            },
        ],
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
                        <Line options={commonOptions} data={pitchData} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Azimuth Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <Line options={commonOptions} data={azimuthData} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
