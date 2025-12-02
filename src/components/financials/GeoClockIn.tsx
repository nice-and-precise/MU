"use client";

import React, { useState, useEffect } from "react";
import { BigButton } from "@/components/ui/BigButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, AlertTriangle } from "lucide-react";
import { InspectionChecklist } from "@/components/field/InspectionChecklist";

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
}

export function GeoClockIn({ projectId, projectLat, projectLong, geofenceRadius, employeeId }: GeoClockInProps) {
    const [status, setStatus] = useState<"OUT" | "IN">("OUT");
    const [location, setLocation] = useState<{ lat: number; long: number } | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [showInspection, setShowInspection] = useState(false);

    useEffect(() => {
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
    }, [projectLat, projectLong]);

    async function handleClockAction() {
        if (!location) {
            alert("Waiting for GPS location...");
            return;
        }

        const isGeofenced = distance !== null && distance <= geofenceRadius;

        if (!isGeofenced) {
            const confirm = window.confirm(`You are ${Math.round(distance || 0)}ft away from the project center (Limit: ${geofenceRadius}ft). Clock in anyway?`);
            if (!confirm) return;
        }

        if (status === "OUT") {
            // Trigger Inspection before Clock In
            setShowInspection(true);
        } else {
            // Clock Out
            setStatus("OUT");
            alert("Clocked OUT!");
        }
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

                <div className={`p-4 rounded-lg border ${distance && distance > geofenceRadius ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
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
                        label={status === "OUT" ? "CLOCK IN" : "CLOCK OUT"}
                        icon={Clock}
                        onClick={handleClockAction}
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
                        <div className="bg-background rounded-xl max-h-[90vh] overflow-y-auto w-full max-w-2xl relative">
                            <InspectionChecklist
                                assetId="truck-1"
                                assetName="Ford F-550 (Truck #12)"
                                onComplete={() => {
                                    setShowInspection(false);
                                    setStatus("IN");
                                    alert("Inspection Passed! Clocked IN.");
                                }}
                            />
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
