

'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Dynamic import for WASM (commented out for now due to build issues)
// import init, { calculate_survey_points } from '../../../../public/wasm/core_rs';

interface SurveyPoint {
    md: number;
    inc: number;
    azi: number;
}

function BoreholeTube({ points }: { points: Float32Array }) {
    const curve = useMemo(() => {
        const vectors = [];
        for (let i = 0; i < points.length; i += 3) {
            vectors.push(new THREE.Vector3(points[i], points[i + 1], points[i + 2]));
        }
        // Ensure we have enough points for a curve
        if (vectors.length < 2) return null;
        return new THREE.CatmullRomCurve3(vectors);
    }, [points]);

    if (!curve) return null;

    return (
        <mesh>
            <tubeGeometry args={[curve, Math.min(points.length / 3, 200), 2, 8, false]} />
            <meshStandardMaterial color="#00ffff" metalness={0.8} roughness={0.2} emissive="#004444" />
        </mesh>
    );
}

export default function DrillPath3D() {
    const [pointsBuffer, setPointsBuffer] = useState<Float32Array>(new Float32Array(0));
    const [wasmLoaded, setWasmLoaded] = useState(false);
    const [bitPosition, setBitPosition] = useState<[number, number, number]>([0, 0, 0]);

    useEffect(() => {
        // Simulate WASM loading delay
        const timer = setTimeout(() => {
            setWasmLoaded(true);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    // Mock Data Generation
    const surveyData = useMemo(() => {
        const data: SurveyPoint[] = [];
        for (let i = 0; i < 500; i++) {
            data.push({
                md: i * 10,
                inc: Math.min(i * 0.2, 90),
                azi: i * 1.5
            });
        }
        return data;
    }, []);

    useEffect(() => {
        if (!wasmLoaded) return;

        // SIMULATE WASM CALCULATION (Fallback since WASM build is blocked)
        // In production: const result = calculate_survey_points(surveyData);

        const count = surveyData.length;
        const buffer = new Float32Array(count * 3);

        let x = 0, y = 0, z = 0;
        let prevMd = 0;

        for (let i = 0; i < count; i++) {
            const p = surveyData[i];
            const dMd = p.md - prevMd;
            const radInc = p.inc * Math.PI / 180;
            const radAzi = p.azi * Math.PI / 180;

            // Simple Minimum Curvature approximation for demo
            // Note: This is JS math, much slower than Rust/WASM for large datasets, 
            // but sufficient for this demo fallback.
            x += Math.sin(radInc) * Math.sin(radAzi) * (dMd / 2);
            y += Math.cos(radInc) * (dMd / 2);
            z += Math.sin(radInc) * Math.cos(radAzi) * (dMd / 2);

            buffer[i * 3] = x;
            buffer[i * 3 + 1] = -y; // Invert Y for depth visualization
            buffer[i * 3 + 2] = z;

            prevMd = p.md;
        }

        setPointsBuffer(buffer);
        setBitPosition([x, -y, z]);

    }, [wasmLoaded, surveyData]);

    return (
        <div className="h-[500px] w-full bg-black rounded-xl border border-gray-800 overflow-hidden relative">
            <div className="absolute top-4 left-4 z-10">
                <h3 className="text-neon-blue font-bold text-lg">3D Borehole View</h3>
                <p className="text-xs text-gray-500">
                    {wasmLoaded ? "Powered by Rust/WASM Core (Simulated)" : "Loading Core..."}
                </p>
            </div>
            <Canvas camera={{ position: [100, 50, 100], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <OrbitControls target={[bitPosition[0], bitPosition[1], bitPosition[2]]} />

                {/* Surface Plane */}
                <gridHelper args={[2000, 50, 0x444444, 0x222222]} position={[0, 0, 0]} />
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                    <planeGeometry args={[2000, 2000]} />
                    <meshStandardMaterial color="#1a1a1a" transparent opacity={0.8} />
                </mesh>

                <axesHelper args={[20]} />

                {pointsBuffer.length > 0 && (
                    <BoreholeTube points={pointsBuffer} />
                )}

                {/* Bit Position */}
                <mesh position={bitPosition}>
                    <coneGeometry args={[3, 8, 16]} rotation={[Math.PI, 0, 0]} />
                    <meshStandardMaterial color="red" emissive="red" emissiveIntensity={0.8} />
                </mesh>
            </Canvas>
        </div>
    );
}
