
'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Cylinder, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { calculateBorePath, SurveyStation } from '@/lib/drilling/math/survey';

interface Bore3DViewProps {
    length: number;
    diameter: number;
    entryAngle?: number;
    exitAngle?: number;
    points?: { x: number, y: number, z: number }[]; // Pre-calculated points
    soilLayers?: any[];
}

function BorePath({ points, diameter }: { points: THREE.Vector3[], diameter: number }) {
    // Create a tube geometry from the points
    const curve = useMemo(() => {
        if (points.length < 2) return null;
        return new THREE.CatmullRomCurve3(points);
    }, [points]);

    if (!curve) return null;

    return (
        <mesh>
            <tubeGeometry args={[curve, 64, diameter / 24, 8, false]} />
            {/* diameter is in inches, scene is in feet. diameter/12 = ft. radius = dia/24 */}
            <meshStandardMaterial color="blue" roughness={0.3} metalness={0.8} />
        </mesh>
    );
}

function GroundPlane() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[1000, 1000]} />
            <meshStandardMaterial color="#3a3a3a" transparent opacity={0.5} side={THREE.DoubleSide} />
            <gridHelper args={[1000, 100]} rotation={[-Math.PI / 2, 0, 0]} />
        </mesh>
    );
}

function SoilLayerVisual({ layer, depth, width = 200 }: { layer: any, depth: number, width?: number }) {
    // Layer is a box at a certain depth
    // depth is positive downwards in our data, but negative Y in Three.js usually?
    // Wait, in our survey.ts: Z is Elevation (Up/Down). 
    // Let's assume Z=0 is surface. Depth 10 = Z=-10.

    const thickness = layer.endDepth - layer.startDepth;
    const midDepth = layer.startDepth + thickness / 2;

    return (
        <mesh position={[50, -midDepth, 0]}> {/* Offset X to not hide bore completely */}
            <boxGeometry args={[width, thickness, 50]} />
            <meshStandardMaterial
                color={layer.color || '#888'}
                transparent
                opacity={0.3}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

export default function Bore3DView({ length, diameter, entryAngle = 12, points, soilLayers = [] }: Bore3DViewProps) {
    const [demoMode, setDemoMode] = React.useState(false);

    // If no points provided, simulate a simple arc based on length and angles
    const calculatedPoints = useMemo(() => {
        if (demoMode) {
            // Generate a complex demo path
            const pts = [];
            const steps = 100;
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const x = t * length;
                // Add some steering corrections (wiggles)
                const y = -1 * Math.sin(t * Math.PI) * (length * 0.15) + (Math.sin(t * 10) * 2);
                const z = Math.sin(t * 5) * 5; // Left/Right steering
                pts.push(new THREE.Vector3(x, y, z));
            }
            return pts;
        }

        if (points) {
            // Filter out invalid points (NaN, Infinity)
            const validPoints = points.filter(p =>
                Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z)
            ).map(p => new THREE.Vector3(p.x, p.z, p.y)); // Swap Y/Z for ThreeJS (Y is Up)

            if (validPoints.length >= 2) {
                return validPoints;
            }
        }

        // Fallback: Simple parabolic arc
        const pts = [];
        const steps = 20;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = t * length;
            const y = -1 * Math.sin(t * Math.PI) * (length * 0.1);
            pts.push(new THREE.Vector3(x, y, 0));
        }
        return pts;
    }, [length, entryAngle, points, demoMode]);

    return (
        <div className="relative h-[600px] w-full bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
            <div className="absolute top-4 left-4 z-10">
                <h3 className="text-white font-bold text-lg drop-shadow-md">3D Digital Twin</h3>
                <p className="text-white/60 text-xs">Real-time drilling telemetry visualization</p>
            </div>

            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                    onClick={() => setDemoMode(!demoMode)}
                    className={`px-3 py-1 rounded text-xs font-bold transition-colors ${demoMode ? 'bg-blue-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                    {demoMode ? 'Disable Demo' : 'Load Demo Bore'}
                </button>
            </div>

            <Canvas
                camera={{ position: [length / 2, 50, 100], fov: 50 }}
                gl={{ preserveDrawingBuffer: true }}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <Environment preset="city" />

                <GroundPlane />

                <BorePath points={calculatedPoints} diameter={diameter} />

                {soilLayers.map((layer, i) => (
                    <SoilLayerVisual key={i} layer={layer} depth={layer.startDepth} width={length * 1.2} />
                ))}

                <OrbitControls target={[length / 2, -20, 0]} />

                {/* 3D Text Annotations */}
                <Text position={[0, 5, 0]} fontSize={5} color="white" anchorX="center" anchorY="bottom">Entry</Text>
                <Text position={[length, 5, 0]} fontSize={5} color="white" anchorX="center" anchorY="bottom">Exit</Text>

                {/* Depth Markers every 100ft */}
                {Array.from({ length: Math.floor(length / 100) }).map((_, i) => (
                    <Text key={i} position={[(i + 1) * 100, 5, 0]} fontSize={3} color="white" anchorX="center" anchorY="bottom">
                        {(i + 1) * 100}'
                    </Text>
                ))}
            </Canvas>

            {/* HUD Overlay */}
            <div className="absolute bottom-4 left-4 pointer-events-none space-y-1">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-white text-xs font-bold">Bore Path</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500/50 rounded-sm"></div>
                    <span className="text-white text-xs">Ground Level</span>
                </div>
            </div>

            <div className="absolute bottom-4 right-4 text-xs text-white/50 pointer-events-none">
                Left Click: Rotate • Right Click: Pan • Scroll: Zoom
            </div>
        </div>
    );
}
