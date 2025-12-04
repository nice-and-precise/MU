'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, Polygon, Marker, Popup, useMapEvents, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pencil, MapPin, Undo, Trash2, Check, X, Wand2, AlertTriangle, Ban } from 'lucide-react';
import { getParcelAtLocation } from '@/lib/MnGeoService';
import { area } from '@turf/area';
import { polygon } from '@turf/helpers';
import kinks from '@turf/kinks';
import { toast } from 'sonner';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface WhiteLineMapProps {
    onPolygonComplete: (coords: [number, number][], center: [number, number], references: string[], dimensions: string[]) => void;
}

// Simple Haversine distance in feet
function calculateDistanceFeet(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // in metres
    return Math.round(d * 3.28084); // convert to feet
}

function MapController({
    mode,
    setPoints,
    points,
    setMarkers,
    markers,
    updateParent,
    onReferenceClick,
    onMapClick
}: any) {
    useMapEvents({
        click(e) {
            if (mode === 'draw') {
                const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng];
                const newPoints = [...points, newPoint];
                setPoints(newPoints);
                updateParent(newPoints, markers);
            } else if (mode === 'reference') {
                onReferenceClick(e.latlng);
            } else if (mode === 'wand') {
                onMapClick(e.latlng);
            }
        },
        contextmenu() {
            // Right click to undo
            if (mode === 'draw' && points.length > 0) {
                const newPoints = points.slice(0, -1);
                setPoints(newPoints);
                updateParent(newPoints, markers);
            }
        }
    });
    return null;
}

function Magnifier({ position, zoom }: { position: L.LatLng | null, zoom: number }) {
    if (!position) return null;
    return (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full border-4 border-white overflow-hidden z-[1000] shadow-2xl pointer-events-none bg-gray-100 ring-2 ring-black/20">
            <MapContainer
                key={`${position.lat}-${position.lng}`} // Force re-render to snap to new center
                center={position}
                zoom={zoom + 3}
                zoomControl={false}
                attributionControl={false}
                dragging={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                style={{ width: '100%', height: '100%' }}
            >
                <WMSTileLayer
                    url="https://imageserver.gisdata.mn.gov/cgi-bin/wms?"
                    layers="FSA2021"
                    format="image/png"
                    transparent={true}
                />
                {/* Crosshair */}
                <div className="absolute top-1/2 left-1/2 w-full h-0.5 bg-red-500/50 -translate-x-1/2 -translate-y-1/2 z-[1000]" />
                <div className="absolute top-1/2 left-1/2 h-full w-0.5 bg-red-500/50 -translate-x-1/2 -translate-y-1/2 z-[1000]" />
            </MapContainer>
        </div>
    );
}

function DraggableMarker({ position, index, onDrag, onDragEnd }: { position: [number, number], index: number, onDrag: (latlng: L.LatLng) => void, onDragEnd: (index: number, latlng: L.LatLng) => void }) {
    const [draggable, setDraggable] = useState(false);
    const map = useMapEvents({});

    const eventHandlers = {
        dragstart() {
            setDraggable(true);
        },
        drag(e: any) {
            onDrag(e.latlng);
        },
        dragend(e: any) {
            setDraggable(false);
            onDragEnd(index, e.latlng);
        },
    };

    return (
        <Marker
            position={position}
            draggable={true}
            eventHandlers={eventHandlers}
            icon={L.divIcon({ className: 'bg-white rounded-full w-4 h-4 border-2 border-blue-600 shadow cursor-move', iconSize: [16, 16] })}
        />
    );
}

export default function WhiteLineMap({ onPolygonComplete }: WhiteLineMapProps) {
    // Default to Minneapolis
    const center: [number, number] = [44.9778, -93.2650];

    const [points, setPoints] = useState<[number, number][]>([]);
    const [markers, setMarkers] = useState<{ lat: number; lng: number; type: string }[]>([]);
    const [mode, setMode] = useState<'draw' | 'reference' | 'wand'>('draw');
    const [showRefModal, setShowRefModal] = useState(false);
    const [tempRefCoords, setTempRefCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [isExcessiveArea, setIsExcessiveArea] = useState(false);
    const [isSelfIntersecting, setIsSelfIntersecting] = useState(false);
    const [isLoadingParcel, setIsLoadingParcel] = useState(false);

    // Magnifier State
    const [magnifierPos, setMagnifierPos] = useState<L.LatLng | null>(null);
    const [mapZoom, setMapZoom] = useState(18);

    const updateParent = (currentPoints: [number, number][], currentMarkers: { lat: number; lng: number; type: string }[]) => {
        // Calculate Area & Self-Intersection
        let excessive = false;
        let intersecting = false;

        if (currentPoints.length >= 3) {
            try {
                // Turf expects [lng, lat]
                const turfPoints = [...currentPoints.map(p => [p[1], p[0]]), [currentPoints[0][1], currentPoints[0][0]]];
                const poly = polygon([turfPoints]);

                // Area Check
                const a = area(poly); // square meters
                const acres = a * 0.000247105;
                if (acres > 2.0) {
                    excessive = true;
                }

                // Self-Intersection Check
                const kinksFound = kinks(poly);
                if (kinksFound.features.length > 0) {
                    intersecting = true;
                }

            } catch (e) {
                console.error("Geometry calc error", e);
            }
        }
        setIsExcessiveArea(excessive);
        setIsSelfIntersecting(intersecting);

        if (currentPoints.length === 0) {
            onPolygonComplete([], [0, 0], [], []);
            return;
        }

        // Calculate center
        const latSum = currentPoints.reduce((sum, p) => sum + p[0], 0);
        const lngSum = currentPoints.reduce((sum, p) => sum + p[1], 0);
        const center: [number, number] = [latSum / currentPoints.length, lngSum / currentPoints.length];

        // Calculate Dimensions
        const dimensions: string[] = [];
        if (currentPoints.length > 1) {
            for (let i = 0; i < currentPoints.length; i++) {
                const p1 = currentPoints[i];
                const p2 = currentPoints[(i + 1) % currentPoints.length]; // Wrap around to close polygon
                // Only calculate closing segment if we have > 2 points
                if (i === currentPoints.length - 1 && currentPoints.length < 3) continue;

                const dist = calculateDistanceFeet(p1[0], p1[1], p2[0], p2[1]);
                dimensions.push(`Segment ${i + 1}: ${dist} ft`);
            }
        }

        // Format References
        const references = currentMarkers.map((m) => `${m.type} at [${m.lat.toFixed(5)}, ${m.lng.toFixed(5)}]`);

        onPolygonComplete(currentPoints, center, references, dimensions);
    };

    const handleReferenceClick = (latlng: { lat: number; lng: number }) => {
        setTempRefCoords(latlng);
        setShowRefModal(true);
    };

    const confirmReference = (type: string) => {
        if (tempRefCoords) {
            const newMarker = { ...tempRefCoords, type };
            const newMarkers = [...markers, newMarker];
            setMarkers(newMarkers);
            updateParent(points, newMarkers);
        }
        setShowRefModal(false);
        setTempRefCoords(null);
    };

    const handleUndo = () => {
        if (mode === 'draw' && points.length > 0) {
            const newPoints = points.slice(0, -1);
            setPoints(newPoints);
            updateParent(newPoints, markers);
        } else if (mode === 'reference' && markers.length > 0) {
            const newMarkers = markers.slice(0, -1);
            setMarkers(newMarkers);
            updateParent(points, newMarkers);
        }
    };

    const handleClear = () => {
        if (confirm('Clear all points and markers?')) {
            setPoints([]);
            setMarkers([]);
            updateParent([], []);
        }
    };

    const handleMarkerDrag = (latlng: L.LatLng) => {
        setMagnifierPos(latlng);
    };

    const handleMarkerDragEnd = (index: number, latlng: L.LatLng) => {
        setMagnifierPos(null);
        const newPoints = [...points];
        newPoints[index] = [latlng.lat, latlng.lng];
        setPoints(newPoints);
        updateParent(newPoints, markers);
    };

    const handleMapClick = async (latlng: L.LatLng) => {
        if (mode === 'wand') {
            setIsLoadingParcel(true);
            toast.info('Fetching parcel data...');
            const parcel = await getParcelAtLocation(latlng.lat, latlng.lng);
            setIsLoadingParcel(false);

            if (parcel && parcel.geometry && parcel.geometry.type === 'Polygon') {
                // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
                // Handle nested arrays for Polygon rings
                const coords = parcel.geometry.coordinates[0].map((p: number[]) => [p[1], p[0]] as [number, number]);
                setPoints(coords);
                updateParent(coords, markers);
                toast.success(`Snapped to parcel: ${parcel.address || 'Unknown Address'}`);
                setMode('draw'); // Switch back to draw to allow editing
            } else {
                toast.error('No parcel found at this location.');
            }
        }
    };

    return (
        <div className="h-[500px] w-full rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 relative flex flex-col">
            <div className="flex-1 relative z-0">
                <MapContainer
                    center={center}
                    zoom={18}
                    style={{ height: '100%', width: '100%' }}
                >
                    <LayersControl position="topright">
                        <LayersControl.BaseLayer checked name="Map (Streets)">
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name="Satellite (MnGeo)">
                            <WMSTileLayer
                                url="https://imageserver.gisdata.mn.gov/cgi-bin/wms?"
                                layers="FSA2021"
                                format="image/png"
                                transparent={true}
                                attribution='&copy; MnGeo'
                                maxZoom={20}
                            />
                        </LayersControl.BaseLayer>
                    </LayersControl>
                    <MapController
                        mode={mode}
                        setPoints={setPoints}
                        points={points}
                        setMarkers={setMarkers}
                        markers={markers}
                        updateParent={updateParent}
                        onReferenceClick={handleReferenceClick}
                        onMapClick={handleMapClick}
                    />

                    {points.length > 0 && (
                        <Polygon positions={points} pathOptions={{ color: isSelfIntersecting ? 'red' : 'white', weight: 4, fillOpacity: 0.4, dashArray: '5, 10' }} />
                    )}
                    {points.map((p, i) => (
                        <DraggableMarker
                            key={`p-${i}`}
                            index={i}
                            position={p}
                            onDrag={handleMarkerDrag}
                            onDragEnd={handleMarkerDragEnd}
                        />
                    ))}
                    {markers.map((m, i) => (
                        <Marker key={`m-${i}`} position={[m.lat, m.lng]}>
                            <Popup>{m.type}</Popup>
                        </Marker>
                    ))}

                    {/* Magnifier Overlay */}
                    {magnifierPos && (
                        <div className="leaflet-bottom leaflet-left" style={{ pointerEvents: 'none', zIndex: 1000 }}>
                            <Magnifier position={magnifierPos} zoom={18} />
                        </div>
                    )}

                    {/* Excessive Area Warning */}
                    {isExcessiveArea && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg z-[1000] flex items-center gap-2 animate-pulse">
                            <AlertTriangle className="h-5 w-5" />
                            <span className="font-bold text-sm">Excessive Area (&gt; 2 Acres)</span>
                        </div>
                    )}

                    {/* Self-Intersection Warning */}
                    {isSelfIntersecting && (
                        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg z-[1000] flex items-center gap-2 animate-pulse">
                            <Ban className="h-5 w-5" />
                            <span className="font-bold text-sm">Invalid Geometry (Self-Intersecting)</span>
                        </div>
                    )}

                    {/* Loading Indicator */}
                    {isLoadingParcel && (
                        <div className="absolute inset-0 bg-black/20 z-[1000] flex items-center justify-center">
                            <div className="bg-white p-4 rounded-lg shadow-lg">
                                <span className="animate-pulse">Loading Parcel...</span>
                            </div>
                        </div>
                    )}
                </MapContainer>

                {/* Reference Type Selection Modal */}
                {showRefModal && (
                    <div className="absolute inset-0 z-[1001] bg-black/50 flex items-center justify-center p-4">
                        <Card className="w-full max-w-xs p-4 space-y-4">
                            <h3 className="font-bold text-lg text-center">Select Reference Type</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {['Hydrant', 'Utility Pole', 'Curb', 'Manhole', 'Tree', 'Sign', 'Driveway', 'Building Corner'].map((type) => (
                                    <Button key={type} variant="outline" onClick={() => confirmReference(type)} className="text-xs">
                                        {type}
                                    </Button>
                                ))}
                            </div>
                            <Button variant="ghost" className="w-full text-red-500" onClick={() => setShowRefModal(false)}>Cancel</Button>
                        </Card>
                    </div>
                )}
            </div>

            {/* Mobile Toolbar */}
            <div className="bg-white dark:bg-slate-900 border-t p-2 flex justify-between items-center gap-2 z-10 shadow-lg">
                <div className="flex gap-2">
                    <Button
                        variant={mode === 'draw' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setMode('draw')}
                        className="h-12 w-12 rounded-full"
                        title="Draw Mode"
                    >
                        <Pencil className="h-5 w-5" />
                    </Button>
                    <Button
                        variant={mode === 'reference' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setMode('reference')}
                        className="h-12 w-12 rounded-full"
                        title="Reference Mode"
                    >
                        <MapPin className="h-5 w-5" />
                    </Button>
                    <Button
                        variant={mode === 'wand' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setMode('wand')}
                        className="h-12 w-12 rounded-full"
                        title="Magic Wand (Snap to Parcel)"
                    >
                        <Wand2 className="h-5 w-5" />
                    </Button>
                </div>

                <div className="text-xs font-medium text-center hidden sm:block">
                    {mode === 'draw' ? 'Tap to add points' : mode === 'reference' ? 'Tap to add reference' : 'Tap parcel to snap'}
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={handleUndo}
                        className="h-12 w-12 rounded-full"
                        title="Undo"
                    >
                        <Undo className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={handleClear}
                        className="h-12 w-12 rounded-full"
                        title="Clear All"
                    >
                        <Trash2 className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="default"
                        size="icon"
                        disabled={isSelfIntersecting}
                        onClick={() => {
                            if (points.length < 3) {
                                alert('Draw a polygon first');
                                return;
                            }
                            if (isSelfIntersecting) {
                                alert('Cannot export invalid geometry. Please fix self-intersections.');
                                return;
                            }
                            // Create GeoJSON
                            const geoJson = {
                                type: 'FeatureCollection',
                                features: [{
                                    type: 'Feature',
                                    properties: { name: 'Excavation Area' },
                                    geometry: {
                                        type: 'Polygon',
                                        coordinates: [points.map(p => [p[1], p[0]])] // Leaflet is LatLng, GeoJSON is LngLat
                                    }
                                }]
                            };
                            import('@/lib/ShapefileGenerator').then(mod => {
                                mod.generateShapefile(geoJson);
                            });
                        }}
                        className={`h-12 w-12 rounded-full ${isSelfIntersecting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
                        title="Export Shapefile"
                    >
                        <Check className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
