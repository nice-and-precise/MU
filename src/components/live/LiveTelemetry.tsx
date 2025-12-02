'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { simulateDrillingData } from '@/app/actions/simulate';
import { getBore, saveImportedLogs } from '@/app/actions/drilling';
import { Activity, ArrowUp, ArrowDown, Play, RefreshCw, Sun, Moon, Upload, AlertTriangle } from 'lucide-react';
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
import dynamic from 'next/dynamic';
import { calculateTrajectory } from '@/lib/drilling/math/mcm';
import { calculateTrueAzimuth } from '@/lib/drilling/math/magnetic';
import { checkCollision, CollisionResult } from '@/lib/drilling/math/collision';
import { SurveyStation, Obstacle } from '@/lib/drilling/types';
import SteeringRose from '../drilling/SteeringRose';
import ImportModal from '../drilling/ImportModal';
import CollisionWarning from '../drilling/CollisionWarning';
import { Gauge } from '../visualization/Gauge';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Borehole3D = dynamic(() => import('../drilling/Borehole3D'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-900 animate-pulse flex items-center justify-center text-slate-500">Loading 3D Engine...</div>
});

interface TelemetryLog {
    depth: number;
    pitch: number;
    azimuth: number;
    toolFace?: number;
    timestamp: string;
    rop?: number;
    wob?: number;
    flow?: number;
    pressure?: number;
    torque?: number;
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
    const [dayMode, setDayMode] = useState(false);
    const [magneticParams, setMagneticParams] = useState({ dip: 0, declination: 0 });
    const [obstacles, setObstacles] = useState<Obstacle[]>([]);
    const [collisions, setCollisions] = useState<CollisionResult[]>([]);
    const [isImportOpen, setIsImportOpen] = useState(false);

    useEffect(() => {
        // Fetch bore details for magnetic params and obstacles
        getBore(boreId).then((bore: any) => {
            if (bore) {
                setMagneticParams({ dip: bore.dip || 0, declination: bore.declination || 0 });
                if (bore.project && bore.project.obstacles) {
                    setObstacles(bore.project.obstacles as unknown as Obstacle[]);
                }
            }
        });
    }, [boreId]);

    const fetchData = async () => {
        try {
            // Use local API for now, or edge URL if configured
            const edgeUrl = process.env.NEXT_PUBLIC_EDGE_FUNCTION_URL;
            const url = edgeUrl
                ? `${edgeUrl}/witsml-logs?boreId=${boreId}`
                : `/api/witsml/latest?boreId=${boreId}`;

            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                // Edge function returns { logs: [...] }, local API returns { ...log }
                const log = edgeUrl ? data.logs[0] : data;

                if (log) {
                    setData(log);
                    setLastUpdated(new Date());

                    // Add to history if it's new
                    setHistory(prev => {
                        if (prev.length > 0 && prev[prev.length - 1].timestamp === log.timestamp) {
                            return prev;
                        }
                        const newHistory = [...prev, log].slice(-50); // Keep last 50 points for better history
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
        const edgeUrl = process.env.NEXT_PUBLIC_EDGE_FUNCTION_URL;
        const streamUrl = edgeUrl
            ? `${edgeUrl}/witsml-stream?boreId=${boreId}`
            : `/api/witsml/stream?boreId=${boreId}`;

        const eventSource = new EventSource(streamUrl);

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
                        const newHistory = [...prev, log].slice(-50);
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

    const handleImport = async (stations: SurveyStation[]) => {
        // Convert stations back to logs (approximate) or just save them
        // We need to save them to the DB so they persist
        // Stations have md, inc, azi.
        const logs = stations.map(s => ({
            md: s.md,
            inc: s.inc,
            azi: s.azi
        }));

        await saveImportedLogs(boreId, logs);

        // Refresh data
        // For now, just manually update history to show it immediately
        const newLogs = logs.map(l => ({
            depth: l.md,
            pitch: l.inc,
            azimuth: l.azi,
            timestamp: new Date().toISOString()
        }));
        setHistory(newLogs as TelemetryLog[]);
        if (newLogs.length > 0) {
            setData(newLogs[newLogs.length - 1] as TelemetryLog);
        }
    };

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'linear' as const,
                title: { display: true, text: 'Depth (ft)' },
                grid: { color: dayMode ? '#e5e7eb' : '#374151' },
                ticks: { color: dayMode ? '#374151' : '#9ca3af' }
            },
            y: {
                title: { display: true, text: 'Degrees' },
                grid: { color: dayMode ? '#e5e7eb' : '#374151' },
                ticks: { color: dayMode ? '#374151' : '#9ca3af' }
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
                data: history.map(h => ({ x: h.depth, y: calculateTrueAzimuth(h.azimuth, magneticParams.declination) })),
                borderColor: '#c084fc',
                backgroundColor: '#c084fc',
                tension: 0.1,
            },
        ],
    };

    const trajectory = useMemo(() => {
        return calculateTrajectory(history.map(h => ({
            md: h.depth,
            inc: h.pitch,
            azi: calculateTrueAzimuth(h.azimuth, magneticParams.declination)
        })));
    }, [history, magneticParams.declination]);

    // Check collisions whenever trajectory or obstacles change
    useEffect(() => {
        if (trajectory.length > 0 && obstacles.length > 0) {
            const results = checkCollision(trajectory, obstacles);
            setCollisions(results);
        } else {
            setCollisions([]);
        }
    }, [trajectory, obstacles]);

    const currentAzimuth = data ? calculateTrueAzimuth(data.azimuth, magneticParams.declination) : 0;

    return (
        <div className={`space-y-6 ${dayMode ? 'bg-white text-gray-900' : ''} transition-colors duration-300`}>
            {/* HUD Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className={`${dayMode ? 'bg-gray-100 border-gray-200' : 'bg-slate-900 border-slate-800'} transition-colors`}>
                    <CardHeader className="pb-2">
                        <CardTitle className={`text-sm font-medium ${dayMode ? 'text-gray-500' : 'text-slate-400'}`}>Bit Depth</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-blue-500">
                            {data?.depth.toFixed(2) || "0.00"} <span className="text-lg text-slate-500">ft</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className={`${dayMode ? 'bg-gray-100 border-gray-200' : 'bg-slate-900 border-slate-800'} transition-colors`}>
                    <CardHeader className="pb-2">
                        <CardTitle className={`text-sm font-medium ${dayMode ? 'text-gray-500' : 'text-slate-400'}`}>Pitch / Inc</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            <div className="text-4xl font-bold text-yellow-500">
                                {data?.pitch.toFixed(2) || "0.00"}°
                            </div>
                            {data && data.pitch > 0 ? <ArrowUp className="text-green-500" /> : <ArrowDown className="text-red-500" />}
                        </div>
                    </CardContent>
                </Card>

                <Card className={`${dayMode ? 'bg-gray-100 border-gray-200' : 'bg-slate-900 border-slate-800'} transition-colors`}>
                    <CardHeader className="pb-2">
                        <CardTitle className={`text-sm font-medium ${dayMode ? 'text-gray-500' : 'text-slate-400'}`}>Azimuth (True)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-purple-500">
                            {currentAzimuth.toFixed(2)}°
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                            Declination: {magneticParams.declination > 0 ? '+' : ''}{magneticParams.declination}°
                        </div>
                    </CardContent>
                </Card>

                {/* Steering Rose */}
                <Card className={`${dayMode ? 'bg-gray-100 border-gray-200' : 'bg-slate-900 border-slate-800'} flex items-center justify-center p-2`}>
                    <div className="w-32 h-32">
                        <SteeringRose
                            toolface={data?.toolFace || 0}
                            pitch={data?.pitch || 0}
                            azimuth={data?.azimuth || 0}
                            dayMode={dayMode}
                        />
                    </div>
                </Card>
            </div>

            {/* Driller's Console (New) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className={`md:col-span-3 ${dayMode ? 'bg-gray-100 border-gray-200' : 'bg-slate-900 border-slate-800'}`}>
                    <CardHeader className={`pb-2 ${dayMode ? 'border-b border-gray-200' : 'border-b border-slate-800'}`}>
                        <CardTitle className={`text-sm font-medium ${dayMode ? 'text-gray-500' : 'text-slate-400'} uppercase tracking-widest flex items-center gap-2`}>
                            <Activity className="h-4 w-4 text-blue-500" /> Driller's Console
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex flex-wrap justify-around items-end gap-8">
                            <Gauge value={data?.rop || 0} min={0} max={100} label="ROP" unit="ft/hr" color="#10b981" />
                            <Gauge value={data?.wob || 0} min={0} max={50} label="WOB" unit="klbs" color="#f59e0b" />
                            <Gauge value={data?.flow || 0} min={0} max={200} label="Flow" unit="gpm" color="#3b82f6" />
                            <Gauge value={data?.pressure || 0} min={0} max={5000} label="Pressure" unit="psi" color="#ef4444" />
                            <Gauge value={data?.torque || 0} min={0} max={15000} label="Torque" unit="ft-lbs" color="#8b5cf6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Controls & Status */}
            <div className={`flex justify-between items-center p-4 rounded-lg ${dayMode ? 'bg-gray-100' : 'bg-slate-800'} transition-colors`}>
                <div className="flex items-center space-x-4">
                    <Button onClick={handleSimulate} disabled={isSimulating} className="bg-blue-600 hover:bg-blue-700">
                        {isSimulating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                        Simulate Data Packet
                    </Button>
                    <Button
                        onClick={() => setIsImportOpen(true)}
                        variant="secondary"
                        className="bg-slate-700 hover:bg-slate-600 text-white"
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        Import Survey
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDayMode(!dayMode)}
                        className={dayMode ? "border-gray-300 hover:bg-gray-200" : "border-slate-600 hover:bg-slate-700 text-white"}
                    >
                        {dayMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Last Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
                    </span>
                </div>
                <div className="text-sm font-mono text-slate-500">
                    BORE: {boreName}
                </div>
            </div>

            {/* Charts & 3D View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <Card className={dayMode ? "bg-white border-gray-200" : ""}>
                        <CardHeader>
                            <CardTitle className={dayMode ? "text-gray-900" : ""}>Pitch Trend</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[250px]">
                            <Line options={commonOptions} data={pitchData} />
                        </CardContent>
                    </Card>

                    <Card className={dayMode ? "bg-white border-gray-200" : ""}>
                        <CardHeader>
                            <CardTitle className={dayMode ? "text-gray-900" : ""}>Azimuth Trend</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[250px]">
                            <Line options={commonOptions} data={azimuthData} />
                        </CardContent>
                    </Card>
                </div>

                {/* 3D View */}
                <Card className={`overflow-hidden flex flex-col h-[600px] lg:h-auto ${dayMode ? "border-gray-200" : ""}`}>
                    <CardHeader>
                        <CardTitle className={dayMode ? "text-gray-900" : ""}>Real-Time 3D View</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 relative min-h-[400px]">
                        <CollisionWarning collisions={collisions} />
                        <Borehole3D
                            stations={trajectory}
                            obstacles={obstacles}
                            viewMode="iso"
                        />
                    </CardContent>
                </Card>
            </div>

            <ImportModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                onImport={handleImport}
            />
        </div>
    );
}
