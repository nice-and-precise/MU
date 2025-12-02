"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Truck, Navigation } from "lucide-react";

// Mock data for fleet
const FLEET_DATA = [
    { id: "t1", name: "Truck 101", type: "F-550", lat: 45.11, lng: -95.04, status: "Moving", speed: 45, eta: "10:30 AM", destination: "Willmar Site" },
    { id: "t2", name: "Truck 102", type: "Ram 5500", lat: 45.12, lng: -95.05, status: "Stopped", speed: 0, eta: "Arrived", destination: "Spicer Site" },
    { id: "t3", name: "Drill Rig 1", type: "Vermeer D24x40", lat: 45.115, lng: -95.045, status: "Working", speed: 0, eta: "On Site", destination: "Willmar Site" },
];

export function LiveFleetMap() {
    const [selectedTruckId, setSelectedTruckId] = React.useState<string | null>(null);

    const selectedTruck = FLEET_DATA.find(t => t.id === selectedTruckId);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Map Area */}
                <div className="lg:col-span-2 h-[600px] bg-slate-100 rounded-xl border border-slate-300 relative overflow-hidden group">
                    {/* Mock Map Background */}
                    <div className="absolute inset-0 bg-[url('/satellite_map_mock.png')] bg-cover bg-center opacity-60"></div>

                    {/* Map Controls */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <button className="bg-white p-2 rounded shadow hover:bg-gray-50"><Navigation className="h-5 w-5 text-blue-600" /></button>
                    </div>

                    {/* Truck Markers */}
                    {FLEET_DATA.map((truck, index) => (
                        <div
                            key={truck.id}
                            onClick={() => setSelectedTruckId(truck.id)}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${selectedTruckId === truck.id ? 'scale-125 z-10' : 'hover:scale-110'}`}
                            style={{
                                top: `${40 + (index * 15)}%`,
                                left: `${30 + (index * 20)}%`
                            }}
                        >
                            <div className={`p-2 rounded-full shadow-lg border-2 ${selectedTruckId === truck.id ? 'border-yellow-400 ring-4 ring-yellow-400/30' : 'border-white'} ${truck.status === 'Moving' ? 'bg-blue-600' : truck.status === 'Working' ? 'bg-green-600' : 'bg-orange-500'}`}>
                                <Truck className="h-5 w-5 text-white" />
                            </div>
                            <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap ${selectedTruckId === truck.id ? 'block' : 'hidden group-hover:block'}`}>
                                {truck.name}
                            </div>
                        </div>
                    ))}

                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur p-2 rounded text-xs text-slate-500">
                        Live GPS Data • Updated 10s ago
                    </div>
                </div>

                {/* Fleet List / Details */}
                <Card className="h-[600px] flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5" /> {selectedTruck ? 'Vehicle Details' : 'Fleet Status'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto space-y-4">
                        {selectedTruck ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold">{selectedTruck.name}</h3>
                                        <p className="text-muted-foreground">{selectedTruck.type}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full font-bold text-sm ${selectedTruck.status === 'Moving' ? 'bg-blue-100 text-blue-800' :
                                        selectedTruck.status === 'Working' ? 'bg-green-100 text-green-800' :
                                            'bg-orange-100 text-orange-800'
                                        }`}>
                                        {selectedTruck.status}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                                        <div className="flex justify-between items-center border-b pb-2">
                                            <span className="text-sm text-muted-foreground">Current Speed</span>
                                            <span className="font-mono font-bold text-lg">{selectedTruck.speed} <span className="text-sm font-normal text-muted-foreground">mph</span></span>
                                        </div>
                                        <div className="flex justify-between items-center border-b pb-2">
                                            <span className="text-sm text-muted-foreground">Heading</span>
                                            <span className="font-mono font-bold">NW 315°</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Fuel Level</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-green-500 w-[75%]"></div>
                                                </div>
                                                <span className="font-bold text-sm">75%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-bold text-sm uppercase text-muted-foreground">Assignment</h4>
                                        <div className="p-3 border rounded-lg">
                                            <div className="font-bold text-blue-700">{selectedTruck.destination}</div>
                                            <div className="text-sm text-muted-foreground">Project #24-001</div>
                                            <div className="mt-2 flex justify-between text-sm">
                                                <span>ETA</span>
                                                <span className="font-bold">{selectedTruck.eta}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-bold text-sm uppercase text-muted-foreground">Crew</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700">JD</div>
                                                <div>
                                                    <div className="font-bold text-sm">John Doe</div>
                                                    <div className="text-xs text-muted-foreground">Driver / Foreman</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded">
                                                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-700">JS</div>
                                                <div>
                                                    <div className="font-bold text-sm">Jane Smith</div>
                                                    <div className="text-xs text-muted-foreground">Operator</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedTruckId(null)}
                                    className="w-full py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-slate-100 rounded"
                                >
                                    ← Back to Fleet List
                                </button>
                            </div>
                        ) : (
                            FLEET_DATA.map(truck => (
                                <div
                                    key={truck.id}
                                    onClick={() => setSelectedTruckId(truck.id)}
                                    className="p-3 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-bold group-hover:text-blue-600 transition-colors">{truck.name}</div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${truck.status === 'Moving' ? 'bg-blue-100 text-blue-800' :
                                            truck.status === 'Working' ? 'bg-green-100 text-green-800' :
                                                'bg-orange-100 text-orange-800'
                                            }`}>
                                            {truck.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <div className="flex justify-between">
                                            <span>Type:</span> <span className="text-foreground">{truck.type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Destination:</span> <span className="text-foreground">{truck.destination}</span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t mt-2">
                                            <span className="font-bold text-blue-600">ETA:</span>
                                            <span className="font-bold">{truck.eta}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
