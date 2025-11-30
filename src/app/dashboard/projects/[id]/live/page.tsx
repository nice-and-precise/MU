
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { getProject } from '@/app/actions/projects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal, Activity, Play, Pause, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SteeringRose from '@/components/drilling/SteeringRose';

export default function LiveTelemetryPage() {
    const params = useParams();
    const projectId = params.id as string;
    const [project, setProject] = useState<any>(null);
    const [selectedBoreId, setSelectedBoreId] = useState<string | null>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [isPolling, setIsPolling] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadProject();
    }, [projectId]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPolling && selectedBoreId) {
            fetchLogs(); // Initial fetch
            interval = setInterval(fetchLogs, 3000); // Poll every 3s
        }
        return () => clearInterval(interval);
    }, [isPolling, selectedBoreId]);

    // Auto-scroll to bottom when logs change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    async function loadProject() {
        const p = await getProject(projectId);
        setProject(p);
        if (p && p.bores.length > 0) {
            setSelectedBoreId(p.bores[0].id);
        }
    }

    async function fetchLogs() {
        if (!selectedBoreId) return;
        try {
            // We fetch the daily report for TODAY
            // Since we don't have a dedicated "getLogs" action yet, we'll use a new API route or action.
            // For now, let's assume we fetch the project/bore and extract logs from the latest daily report.
            // Ideally, we should create a server action for this.

            const res = await fetch(`/api/witsml/logs?boreId=${selectedBoreId}`);
            const data = await res.json();

            if (data.success && data.logs) {
                setLogs(data.logs);
                setLastUpdate(new Date());
            }
        } catch (error) {
            console.error("Polling error", error);
        }
    }

    async function simulateData() {
        if (!selectedBoreId) return;

        // Send a mock POST to /api/witsml
        const mockDepth = (logs.length + 1) * 15; // 15ft rods
        const mockPitch = Math.random() * 10 - 5; // -5 to +5 degrees
        const mockAzimuth = 180 + (Math.random() * 10 - 5); // Approx South

        const payload = {
            boreId: selectedBoreId,
            depth: mockDepth,
            pitch: mockPitch.toFixed(1),
            azimuth: mockAzimuth.toFixed(1),
            timestamp: new Date().toISOString()
        };

        await fetch('/api/witsml', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Trigger immediate fetch
        fetchLogs();
    }

    return (
        <div className="p-8 space-y-6 h-[calc(100vh-64px)] flex flex-col">
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center">
                        <Activity className="mr-2 h-6 w-6 text-green-500" />
                        Live Operations
                    </h1>
                    <p className="text-muted-foreground">Real-time WITSML / LWD telemetry stream.</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="w-[250px]">
                        <Select value={selectedBoreId || ''} onValueChange={setSelectedBoreId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Bore" />
                            </SelectTrigger>
                            <SelectContent>
                                {project?.bores.map((b: any) => (
                                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        variant={isPolling ? "destructive" : "default"}
                        onClick={() => setIsPolling(!isPolling)}
                    >
                        {isPolling ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                        {isPolling ? "Stop Stream" : "Start Stream"}
                    </Button>
                    <Button variant="outline" onClick={simulateData} disabled={!selectedBoreId}>
                        Simulate Packet
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Left: Raw Stream */}
                <Card className="lg:col-span-2 flex flex-col min-h-0 bg-black border-slate-800">
                    <CardHeader className="pb-2 border-b border-slate-800 bg-slate-900/50">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-sm font-mono text-green-400 flex items-center">
                                <Terminal className="mr-2 h-4 w-4" /> RAW_STREAM_MONITOR
                            </CardTitle>
                            <Badge variant="outline" className="text-xs font-mono text-slate-400 border-slate-700">
                                {isPolling ? 'CONNECTED' : 'OFFLINE'} • {lastUpdate.toLocaleTimeString()}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 min-h-0 relative">
                        <div
                            ref={scrollRef}
                            className="absolute inset-0 overflow-y-auto p-4 font-mono text-xs space-y-1 text-slate-300"
                        >
                            {logs.length === 0 ? (
                                <div className="text-slate-600 italic">Waiting for data stream...</div>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className="flex space-x-4 border-b border-slate-900/50 pb-1 mb-1 hover:bg-slate-900/30">
                                        <span className="text-slate-500 w-20 shrink-0">
                                            {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '--:--:--'}
                                        </span>
                                        <span className="text-blue-400 w-24 shrink-0">
                                            DEPTH: {log.lf || log.depth}
                                        </span>
                                        <span className="text-yellow-400 w-24 shrink-0">
                                            PTCH: {log.pitch}°
                                        </span>
                                        <span className="text-purple-400 w-24 shrink-0">
                                            AZM: {log.azimuth}°
                                        </span>
                                        <span className="text-slate-400 truncate">
                                            ID: {log.boreId?.substring(0, 8)}...
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Right: Heads Up Display */}
                <Card className="flex flex-col min-h-0">
                    <CardHeader>
                        <CardTitle>Telemetry HUD</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {logs.length > 0 ? (
                            <>
                                <div className="space-y-1">
                                    <div className="text-sm text-muted-foreground">Current Depth</div>
                                    <div className="text-4xl font-bold text-blue-600">
                                        {logs[logs.length - 1].lf || logs[logs.length - 1].depth || 0}'
                                    </div>
                                </div>
                                <div className="flex justify-center py-4">
                                    <SteeringRose
                                        toolFace={logs[logs.length - 1].toolFace || (logs[logs.length - 1].azimuth % 360)} // Mock TF using Azimuth for now if missing
                                        pitch={logs[logs.length - 1].pitch}
                                        azimuth={logs[logs.length - 1].azimuth}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
                                        <div className="text-xs text-muted-foreground mb-1">PITCH</div>
                                        <div className="text-2xl font-bold">
                                            {logs[logs.length - 1].pitch}°
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
                                        <div className="text-xs text-muted-foreground mb-1">AZIMUTH</div>
                                        <div className="text-2xl font-bold">
                                            {logs[logs.length - 1].azimuth}°
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                                    <div className="flex items-center space-x-2 text-green-700 dark:text-green-400">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                        </span>
                                        <span className="font-semibold">Signal Active</span>
                                    </div>
                                    <p className="text-xs mt-2 text-green-600/80">
                                        Receiving packets from DCI DigiTrak via WITSML Gateway.
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-center">
                                <Activity className="h-10 w-10 mb-2 opacity-20" />
                                <p>No active telemetry.</p>
                                <p className="text-xs">Start stream or simulate data.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
