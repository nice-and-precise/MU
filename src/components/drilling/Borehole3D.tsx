"use client";

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Center, Text, PerspectiveCamera, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import { SurveyStation } from '../../lib/drilling/types';

interface Obstacle {
    id: string;
    type: 'gas' | 'water' | 'electric' | 'fiber' | 'sewer' | 'abandoned';
    x: number;
    y: number;
    z: number;
    diameter: number;
    length: number;
    azimuth: number;
}

interface TargetZone {
    id: string;
    x: number;
    y: number;
    z: number;
    width: number;
    height: number;
    depth: number;
}

interface Borehole3DProps {
    stations: SurveyStation[];
    ghostPath?: SurveyStation[];
    diameter?: number;
    obstacles?: Obstacle[];
    targets?: TargetZone[];
    viewMode?: 'iso' | 'top' | 'side';
    flyThrough?: boolean;
}

const BoreholeTube = ({ stations, diameter = 1, color = "orange", dashed = false }: { stations: SurveyStation[], diameter?: number, color?: string, dashed?: boolean }) => {
    const path = useMemo(() => {
        if (stations.length < 2) return null;
        const points = stations.map(s => new THREE.Vector3(s.east, -s.tvd, -s.north));
        return new THREE.CatmullRomCurve3(points);
    }, [stations]);

    if (!path) return null;

    return (
        <mesh>
            <tubeGeometry args={[path, stations.length * 4, diameter, 8, false]} />
            <meshStandardMaterial
                color={color}
                roughness={0.4}
                metalness={0.1}
                transparent={dashed}
                opacity={dashed ? 0.5 : 1}
                wireframe={dashed}
            />
        </mesh>
    );
};

const GroundPlane = () => {
    const texture = useLoader(THREE.TextureLoader, '/satellite_map_mock.png');
    return (
        <group>
            {/* Main Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[500, 0, -500]}>
                <planeGeometry args={[2000, 2000]} />
                <meshStandardMaterial map={texture} transparent opacity={0.8} />
            </mesh>

            {/* Road Overlay */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[500, 0.5, -200]}>
                <planeGeometry args={[2000, 60]} />
                <meshStandardMaterial color="#333" roughness={0.9} />
            </mesh>
            <Text position={[100, 2, -200]} rotation={[-Math.PI / 2, 0, 0]} fontSize={20} color="white">
                Main St
            </Text>
        </group>
    );
};

const Building = ({ x, z }: { x: number, z: number }) => {
    return (
        <group position={[x, 0, -z]}>
            <mesh position={[0, 20, 0]}>
                <boxGeometry args={[60, 40, 60]} />
                <meshStandardMaterial color="#cbd5e1" />
            </mesh>
            <Text position={[0, 45, 0]} fontSize={10} color="black">
                Warehouse
            </Text>
        </group>
    );
};

const ObstacleMesh = ({ obs }: { obs: Obstacle }) => {
    let color = 'orange';
    switch (obs.type) {
        case 'gas': color = 'yellow'; break;
        case 'water': color = 'blue'; break;
        case 'electric': color = 'red'; break;
        case 'fiber': color = 'red'; break;
        case 'sewer': color = '#4d7c0f'; break; // Green/Brown
        case 'abandoned': color = '#64748b'; break; // Slate
    }

    // Rotation Logic:
    // 1. Cylinder is Y-aligned by default.
    // 2. Rotate 90 deg around X to make it Z-aligned (Horizontal).
    // 3. Rotate around Y by Azimuth to point in correct compass direction.

    return (
        <group position={[obs.x, -obs.y, -obs.z]} rotation={[0, -obs.azimuth * (Math.PI / 180), 0]}>
            <group rotation={[Math.PI / 2, 0, 0]}>
                {/* The Pipe */}
                <mesh>
                    <cylinderGeometry args={[obs.diameter / 2, obs.diameter / 2, obs.length, 16]} />
                    <meshStandardMaterial color={color} opacity={0.8} transparent />
                </mesh>

                {/* Safety Ring (Warning Zone - e.g. 10ft radius) */}
                <mesh>
                    <cylinderGeometry args={[10, 10, obs.length, 16]} />
                    <meshBasicMaterial color="red" opacity={0.1} transparent depthWrite={false} side={THREE.DoubleSide} />
                </mesh>
            </group>

            <Text position={[0, 15, 0]} fontSize={10} color="white" anchorX="center" anchorY="bottom">
                {obs.type.toUpperCase()}
            </Text>
        </group>
    );
};

const TargetBox = ({ target }: { target: TargetZone }) => {
    return (
        <mesh position={[target.x, -target.y, -target.z]}>
            <boxGeometry args={[target.width, target.height, target.depth]} />
            <meshStandardMaterial color="#00ff00" opacity={0.3} transparent />
            <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(target.width, target.height, target.depth)]} />
                <lineBasicMaterial color="#00ff00" />
            </lineSegments>
        </mesh>
    );
};

// Camera Controller Component
const CameraController = ({ viewMode, flyThrough, stations }: { viewMode: string, flyThrough: boolean, stations: SurveyStation[] }) => {
    const { camera, controls } = useThree();
    const progress = useRef(0);

    // Create curve for the camera to follow
    const curve = useMemo(() => {
        if (stations.length < 2) return null;
        const points = stations.map(s => new THREE.Vector3(s.east, -s.tvd, -s.north));
        return new THREE.CatmullRomCurve3(points);
    }, [stations]);

    // Reset progress when toggling
    useEffect(() => {
        if (flyThrough) {
            progress.current = 0;
        }
    }, [flyThrough]);

    // Handle View Modes (Only when NOT flying)
    useEffect(() => {
        if (flyThrough) return;

        if (controls) {
            // @ts-ignore
            controls.target.set(500, -50, -500);
            // @ts-ignore
            controls.update();
        }

        if (viewMode === 'top') {
            // Orthographic Top View
            camera.position.set(500, 1000, -500);
            camera.lookAt(500, 0, -500);
            camera.rotation.set(-Math.PI / 2, 0, 0); // Force down
            if (camera.type === 'OrthographicCamera') {
                camera.zoom = 0.5;
                camera.updateProjectionMatrix();
            }
        } else if (viewMode === 'side') {
            // Orthographic Side View (Looking North)
            camera.position.set(500, -50, 1500);
            camera.lookAt(500, -50, -500);
            if (camera.type === 'OrthographicCamera') {
                camera.zoom = 0.5;
                camera.updateProjectionMatrix();
            }
        } else {
            // Iso Perspective
            camera.position.set(200, 200, 200);
            camera.lookAt(500, -50, -500);
        }
    }, [viewMode, camera, controls, flyThrough]);

    // Handle Fly Through Animation
    useFrame((state, delta) => {
        if (!flyThrough || !curve) return;

        // Advance progress (0 to 1)
        const duration = 15; // seconds
        progress.current += delta / duration;

        if (progress.current >= 1) {
            progress.current = 0; // Loop
        }

        const t = progress.current;

        // Get position and tangent at t
        const position = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();

        // Calculate LookAt target (ahead of current position)
        const lookAtT = Math.min(t + 0.05, 1);
        const lookAtPos = curve.getPointAt(lookAtT);

        // Camera Position: Behind and slightly above
        const cameraPos = position.clone()
            .sub(tangent.clone().multiplyScalar(30)) // 30 units behind
            .add(new THREE.Vector3(0, 10, 0));       // 10 units up (Global Up)

        camera.position.copy(cameraPos);
        camera.lookAt(lookAtPos);

        // Sync OrbitControls target so it doesn't snap back when stopping
        if (controls) {
            // @ts-ignore
            controls.target.copy(lookAtPos);
            // @ts-ignore
            controls.update();
        }
    });

    return null;
};

export default function Borehole3D({ stations, ghostPath = [], obstacles = [], targets = [], viewMode = 'iso', flyThrough = false }: Borehole3DProps) {
    const isOrtho = viewMode === 'top' || viewMode === 'side';

    return (
        <div className="h-full w-full bg-slate-900 rounded-lg overflow-hidden relative">
            <Canvas>
                {/* Switch between Perspective and Orthographic based on mode */}
                {isOrtho ? (
                    <OrthographicCamera makeDefault position={[0, 0, 0]} zoom={10} near={-2000} far={2000} />
                ) : (
                    <PerspectiveCamera makeDefault position={[200, 200, 200]} fov={45} />
                )}

                <ambientLight intensity={0.7} />
                <directionalLight position={[100, 200, 50]} intensity={1} castShadow />

                <CameraController viewMode={viewMode} flyThrough={flyThrough} stations={stations} />

                <Center>
                    <group>
                        <BoreholeTube stations={stations} />
                        {ghostPath.length > 0 && (
                            <BoreholeTube stations={ghostPath} color="cyan" dashed={true} diameter={0.5} />
                        )}
                        <GroundPlane />
                        <Building x={800} z={100} />

                        {obstacles.map(obs => (
                            <ObstacleMesh key={obs.id} obs={obs} />
                        ))}

                        {targets.map(t => (
                            <TargetBox key={t.id} target={t} />
                        ))}
                    </group>
                </Center>

                <Grid
                    infiniteGrid
                    fadeDistance={2000}
                    sectionColor="#ffffff"
                    cellColor="#4a4a4a"
                    position={[0, -0.1, 0]}
                    sectionSize={100}
                />
                <OrbitControls makeDefault maxPolarAngle={Math.PI / 2} enableRotate={!isOrtho && !flyThrough} enabled={!flyThrough} />
            </Canvas>

            {/* Legend Overlay */}
            <div className="absolute bottom-4 left-4 bg-black/60 p-2 rounded text-xs text-white backdrop-blur-sm pointer-events-none select-none">
                <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-orange-500 rounded-full"></div> Borehole</div>
                <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-yellow-500 rounded-full"></div> Gas Line</div>
                <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> Water Main</div>
                <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-red-500 rounded-full"></div> Electric/Fiber</div>
                <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-emerald-800 rounded-full"></div> Sewer</div>
                <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-slate-500 rounded-full"></div> Abandoned</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 border border-green-500 bg-green-500/30"></div> Target Zone</div>
            </div>
        </div>
    );
}
