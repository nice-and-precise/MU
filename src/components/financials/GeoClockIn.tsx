"use client";

import React, { useState, useEffect, useTransition } from "react";
import { BigButton } from "@/components/ui/BigButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { InspectionChecklist } from "@/components/field/InspectionChecklist";
import { clockIn, clockOut, getClockStatus } from "@/actions/time";
import { OfflineQueue } from "@/lib/offline-queue";
import { toast } from "sonner";

// Haversine formula to calculate distance in feet
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 20902231; // Radius of Earth in feet
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

interface GeoClockInProps {
    projectId: string;
    projectLat: number;
    projectLong: number;
    geofenceRadius: number; // in feet
    employeeId: string;
    minimal?: boolean;
    initialActiveEntry?: any; // Pass the active entry if known
    assets?: any[];
}

export function GeoClockIn({ projectId, projectLat, projectLong, geofenceRadius, employeeId, minimal = false, initialActiveEntry, assets = [] }: GeoClockInProps) {
    const [status, setStatus] = useState<"OUT" | "IN" | "BLOCKED">("OUT");
    const [blockedProjectName, setBlockedProjectName] = useState<string | null>(null);
    const [location, setLocation] = useState<{ lat: number; long: number } | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [showInspection, setShowInspection] = useState(false);
    const [selectedAssetId, setSelectedAssetId] = useState<string>("");
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const checkStatus = (entry: any) => {
            if (entry) {
                if (entry.projectId === projectId) {
                    setStatus("IN");
                } else {
                    setStatus("BLOCKED");
                    // Assuming entry might have project relation loaded, or we just say "Another Project"
                    // If the entry came from getClockStatus, it might not have project name.
                    setBlockedProjectName(entry.project?.name || "another project");
                }
            } else {
                setStatus("OUT");
            }
        };

        if (initialActiveEntry !== undefined) {
            checkStatus(initialActiveEntry);
        } else if (employeeId && employeeId !== "current-user") {
            // Fallback to fetch if not provided
            getClockStatus(employeeId).then(res => {
                if (res.success) {
                    checkStatus(res.data);
                }
            });
        }

        // Watch position
        if ("geolocation" in navigator) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ lat: latitude, long: longitude });

                    if (projectLat && projectLong) {
                        const dist = calculateDistance(latitude, longitude, projectLat, projectLong);
                        setDistance(dist);
                    }
                },
                (err) => setError("GPS Error: " + err.message),
                { enableHighAccuracy: true }
            );
            return () => navigator.geolocation.clearWatch(watchId);
        } else {
            setError("Geolocation not supported");
        }
    }, [projectLat, projectLong, employeeId, projectId, initialActiveEntry]);

    function handleClockAction() {
        // GPS Missing Handling
        if (!location) {
            const confirm = window.confirm("GPS location is not available. Clock in manually with 'No Location'?");
            if (!confirm) return;
            // Proceed with 0,0 location
        }

        const isGeofenced = location && distance !== null && distance <= geofenceRadius;

        // If we have location but are outside fence, warn
        if (location && !isGeofenced) {
            const confirm = window.confirm(`You are ${Math.round(distance || 0)}ft away from the project center (Limit: ${geofenceRadius}ft). Clock in anyway?`);
            if (!confirm) return;
        }

        if (status === "OUT") {
            // Trigger Inspection before Clock In
            setShowInspection(true);
        } else {
            // Clock Out
            performClockOut();
        }
    }

    function performClockIn() {
        startTransition(async () => {
            if (!navigator.onLine) {
                OfflineQueue.add('TIME_CLOCK_IN', {
                    employeeId,
                    projectId,
                    lat: location ? location.lat : 0,
                    long: location ? location.long : 0,
                    type: "WORK"
                });
                setStatus("IN");
                toast.success("Offline: Clock In queued");
                return;
            }

            try {
                const res = await clockIn({
                    employeeId,
                    projectId,
                    lat: location ? location.lat : 0,
                    long: location ? location.long : 0,
                    type: "WORK"
                });

                if (res.success) {
                    setStatus("IN");
                    toast.success("Clocked IN!");
                } else {
                    toast.error("Failed to clock in: " + res.error);
                }
            } catch (e) {
                console.error(e);
                toast.error("Error clocking in");
            }
        });
    }

    function performClockOut() {
        startTransition(async () => {
            if (!navigator.onLine) {
                OfflineQueue.add('TIME_CLOCK_OUT', {
                    employeeId,
                    lat: location ? location.lat : 0,
                    long: location ? location.long : 0
                });
                setStatus("OUT");
                toast.success("Offline: Clock Out queued");
                return;
            }

            try {
                const res = await clockOut({
                    employeeId,
                    lat: location ? location.lat : 0,
                    long: location ? location.long : 0
                });

                if (res.success) {
                    setStatus("OUT");
                    toast.success("Clocked OUT!");
                } else {
                    toast.error("Failed to clock out: " + res.error);
                }
            } catch (e) {
                console.error(e);
                toast.error("Error clocking out");
            }
        });
    }

    if (minimal) {
        return (
            <>
                <Button
                    size="sm"
                    variant={status === "IN" ? "destructive" : (status === "BLOCKED" ? "secondary" : "default")}
                    onClick={handleClockAction}
                    disabled={isPending || status === "BLOCKED"}
                    className={status === "OUT" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                        status === "IN" ? "Clock Out" : (
                            status === "BLOCKED" ? `In at ${blockedProjectName}` : "Clock In"
                        )
                    )}
                </Button>

                {/* Inspection Modal for Minimal Mode */}
                {showInspection && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-background rounded-xl max-h-[90vh] overflow-y-auto w-full max-w-2xl relative p-6">
                            <h2 className="text-xl font-bold mb-4">Pre-Trip Inspection</h2>

                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-2">Select Vehicle / Asset</label>
                                <select
                                    className="w-full p-2 border rounded-md"
                                    value={selectedAssetId}
                                    onChange={(e) => setSelectedAssetId(e.target.value)}
                                >
                                    <option value="">-- Select Vehicle --</option>
                                    {assets.map(a => (
                                        <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                                    ))}
                                </select>
                            </div>

                            {selectedAssetId ? (
                                <InspectionChecklist
                                    assetId={selectedAssetId}
                                    assetName={assets.find(a => a.id === selectedAssetId)?.name || "Unknown Asset"}
                                    onComplete={() => {
                                        setShowInspection(false);
                                        performClockIn();
                                    }}
                                />
                            ) : (
                                <div className="text-center py-8 text-muted-foreground bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed dark:border-slate-700">
                                    Please select a vehicle to begin inspection.
                                </div>
                            )}

                            <button
                                onClick={() => setShowInspection(false)}
                                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-2 bg-white/80 dark:bg-slate-800/80 rounded-full"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <Card className="max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Time Clock</span>
                    {status === "IN" && <span className="text-green-600 animate-pulse">● Live</span>}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-center space-y-2">
                    <div className="text-4xl font-black font-mono">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString()}
                    </div>
                </div>

                <div className={`p-4 rounded-lg border ${distance && distance > geofenceRadius ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900" : "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900"}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin className={`h-5 w-5 ${distance && distance > geofenceRadius ? "text-red-500" : "text-green-600"}`} />
                        <span className="font-bold">
                            {location ? "GPS Locked" : "Searching for GPS..."}
                        </span>
                    </div>
                    {distance !== null && (
                        <div className="text-sm">
                            Distance to Site: <strong>{Math.round(distance)} ft</strong>
                            <br />
                            Geofence: <strong>{geofenceRadius} ft</strong>
                        </div>
                    )}
                    {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <BigButton
                        label={isPending ? "PROCESSING..." : (status === "OUT" ? "CLOCK IN" : "CLOCK OUT")}
                        icon={isPending ? Loader2 : Clock}
                        onClick={handleClockAction}
                        disabled={isPending}
                        className={status === "OUT" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
                    />
                    <BigButton
                        label="DIRECTIONS"
                        icon={MapPin}
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${projectLat},${projectLong}`, "_blank")}
                        variant="outline"
                        className="border-blue-500 text-blue-600 hover:bg-blue-50"
                    />
                </div>

                {/* Inspection Modal */}
                {showInspection && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-background rounded-xl max-h-[90vh] overflow-y-auto w-full max-w-2xl relative p-6">
                            <h2 className="text-xl font-bold mb-4">Pre-Trip Inspection</h2>

                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-2">Select Vehicle / Asset</label>
                                <select
                                    className="w-full p-2 border rounded-md"
                                    value={selectedAssetId}
                                    onChange={(e) => setSelectedAssetId(e.target.value)}
                                >
                                    <option value="">-- Select Vehicle --</option>
                                    {assets.map(a => (
                                        <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                                    ))}
                                </select>
                            </div>

                            {selectedAssetId ? (
                                <InspectionChecklist
                                    assetId={selectedAssetId}
                                    assetName={assets.find(a => a.id === selectedAssetId)?.name || "Unknown Asset"}
                                    onComplete={() => {
                                        setShowInspection(false);
                                        performClockIn();
                                    }}
                                />
                            ) : (
                                <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                                    Please select a vehicle to begin inspection.
                                </div>
                            )}

                            <button
                                onClick={() => setShowInspection(false)}
                                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-2 bg-white/80 rounded-full"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

