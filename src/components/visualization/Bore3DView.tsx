
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
    // If no points provided, simulate a simple arc based on length and angles
    const calculatedPoints = useMemo(() => {
        if (points) return points.map(p => new THREE.Vector3(p.x, p.z, p.y)); // Swap Y/Z for ThreeJS (Y is Up)

        // Simulate:
        // Simple parabolic arc for visualization if no real data
        const pts = [];
        const steps = 20;
        const radianEntry = (entryAngle * Math.PI) / 180;

        // Naive arc:
        // x goes from 0 to length (approx)
        // y starts at 0, goes down, then up
        // This is just a visual placeholder
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = t * length;
            // Parabola: y = 4h * (x/L) * (1 - x/L) ? No, we need entry angle.
            // Let's just use the survey lib if we had stations.
            // Fallback:
            const y = -1 * Math.sin(t * Math.PI) * (length * 0.1); // Depth approx 10% of length
            pts.push(new THREE.Vector3(x, y, 0));
        }
        return pts;
    }, [length, entryAngle, points]);

    return (
        <div className="h-[400px] w-full bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
            <Canvas camera={{ position: [length / 2, 50, 100], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <Environment preset="city" />

                <GroundPlane />

                <BorePath points={calculatedPoints} diameter={diameter} />

                {soilLayers.map((layer, i) => (
                    <SoilLayerVisual key={i} layer={layer} depth={layer.startDepth} width={length * 1.2} />
                ))}

                <OrbitControls target={[length / 2, -20, 0]} />

                {/* Annotations */}
                <Text position={[0, 5, 0]} fontSize={5} color="white">Entry</Text>
                <Text position={[length, 5, 0]} fontSize={5} color="white">Exit</Text>
            </Canvas>
            <div className="absolute bottom-4 right-4 text-xs text-white/50 pointer-events-none">
                Left Click: Rotate • Right Click: Pan • Scroll: Zoom
            </div>
        </div>
    );
}
