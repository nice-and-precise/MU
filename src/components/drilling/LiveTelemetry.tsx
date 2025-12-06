'use client';

import { useEffect, useState, useRef } from 'react';
import { getLatestBoreTelemetry } from '@/actions/telemetry';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Gauge, RotateCw, Navigation, Wifi } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../ui/button';

interface LiveTelemetryProps {
    boreId: string;
    onCopyValues?: (pitch: number, azimuth: number) => void;
}

interface TelemetryData {
    timestamp: Date;
    depth: number;
    pitch: number | null;
    azimuth: number | null;
    rpm: number | null;
    pumpPressure: number | null;
    torque: number | null;
    flowRate: number | null;
    wob: number | null;
}

export default function LiveTelemetry({ boreId, onCopyValues }: LiveTelemetryProps) {
    const [data, setData] = useState<TelemetryData | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchData = async () => {
        const res = await getLatestBoreTelemetry({ boreId });
        if (res?.data) {
            setData(res.data);
            // Consider connected if data is less than 10 seconds old
            const age = new Date().getTime() - new Date(res.data.timestamp).getTime();
            setIsConnected(age < 10000);
        } else {
            setIsConnected(false);
        }
    };

    useEffect(() => {
        fetchData();
        intervalRef.current = setInterval(fetchData, 2000); // Poll every 2s

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [boreId]);

    const getValueColor = (val: number | null | undefined, threshold: number) => {
        if (val === null || val === undefined) return 'text-slate-400';
        return val > threshold ? 'text-red-500' : 'text-slate-900';
    };

    if (!data) {
        return (
            <Card className="border-dashed">
                <CardContent className="p-6 text-center text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Waiting for rig telemetry...
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`border-l-4 ${isConnected ? 'border-l-green-500' : 'border-l-red-500'} shadow-sm`}>
            <CardHeader className="py-2 pb-0">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                        <Activity className="w-4 h-4 text-blue-500" />
                        Live Rig Data
                        {isConnected ? (
                            <span className="text-xs font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Online
                            </span>
                        ) : (
                            <span className="text-xs font-normal text-red-600 bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Wifi className="w-3 h-3" /> Offline ({format(new Date(data.timestamp), 'HH:mm:ss')})
                            </span>
                        )}
                    </CardTitle>
                    {onCopyValues && isConnected && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-6 text-blue-600 hover:text-blue-800"
                            onClick={() => {
                                if (data.pitch !== null) onCopyValues(data.pitch, data.azimuth || 0);
                            }}
                        >
                            Use Values
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-3 pt-2">
                <div className="grid grid-cols-4 gap-2 text-center">
                    {/* Primary Drilling Params */}
                    <div className="bg-slate-50 p-2 rounded-md border border-slate-100">
                        <div className="text-[10px] text-slate-500 uppercase flex items-center justify-center gap-1">
                            <RotateCw className="w-3 h-3" /> RPM
                        </div>
                        <div className="text-xl font-mono font-bold text-slate-900">
                            {data.rpm?.toFixed(0) || '-'}
                        </div>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-md border border-slate-100">
                        <div className="text-[10px] text-slate-500 uppercase flex items-center justify-center gap-1">
                            <Gauge className="w-3 h-3" /> PSI
                        </div>
                        <div className={`text-xl font-mono font-bold ${getValueColor(data.pumpPressure, 1200)}`}>
                            {data.pumpPressure?.toFixed(0) || '-'}
                        </div>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-md border border-slate-100">
                        <div className="text-[10px] text-slate-500 uppercase flex items-center justify-center gap-1">
                            <Navigation className="w-3 h-3" /> Pitch
                        </div>
                        <div className="text-xl font-mono font-bold text-slate-900">
                            {data.pitch?.toFixed(1) || '-'}%
                        </div>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-md border border-slate-100">
                        <div className="text-[10px] text-slate-500 uppercase flex items-center justify-center gap-1">
                            <Navigation className="w-3 h-3 rotate-90" /> Azi
                        </div>
                        <div className="text-xl font-mono font-bold text-slate-900">
                            {data.azimuth?.toFixed(1) || '-'}°
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-100">
                    <div className="text-center">
                        <div className="text-[10px] text-slate-400">Torque</div>
                        <div className="font-mono text-sm">{data.torque?.toFixed(0) || '-'}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[10px] text-slate-400">Flow</div>
                        <div className="font-mono text-sm">{data.flowRate?.toFixed(0) || '-'}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[10px] text-slate-400">Live Depth</div>
                        <div className="font-mono text-sm text-blue-600 font-bold">{data.depth?.toFixed(1) || '-'}ft</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

import { Loader2 } from 'lucide-react';
