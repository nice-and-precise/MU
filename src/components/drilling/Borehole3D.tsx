"use client";

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Center, Text, PerspectiveCamera, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import { SurveyStation, Obstacle } from '../../lib/drilling/types';


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
    const typeLower = obs.type.toLowerCase();
    if (typeLower.includes('gas')) color = 'yellow';
    else if (typeLower.includes('water')) color = 'blue';
    else if (typeLower.includes('electric')) color = 'red';
    else if (typeLower.includes('fiber')) color = 'red';
    else if (typeLower.includes('sewer')) color = '#4d7c0f';
    else if (typeLower.includes('abandoned')) color = '#64748b';

    // Calculate geometry from start/end points
    const start = new THREE.Vector3(obs.startX, -obs.startY, -obs.startZ); // Assuming Y is depth in DB? No, Z is depth usually.
    // Wait, in BoreholeTube we used: new THREE.Vector3(s.east, -s.tvd, -s.north)
    // So: X=East, Y=-TVD(Depth), Z=-North
    // In DB: startX, startY, startZ. Let's assume X=East, Y=North, Z=Depth(TVD)
    const p1 = new THREE.Vector3(obs.startX, -obs.startY, -obs.startZ);

    let p2: THREE.Vector3;
    if (obs.endX !== null && obs.endX !== undefined) {
        p2 = new THREE.Vector3(obs.endX, -(obs.endY || obs.startY), -(obs.endZ || obs.startZ));
    } else {
        // Point obstacle (e.g. manhole) - make it a small vertical cylinder or sphere
        p2 = p1.clone().add(new THREE.Vector3(0, 5, 0)); // 5ft tall marker
    }

    const direction = new THREE.Vector3().subVectors(p2, p1);
    const length = direction.length();

    // Position is midpoint
    const position = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

    // Orientation
    const quaternion = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    quaternion.setFromUnitVectors(up, direction.normalize());

    const diameter = obs.diameter ? obs.diameter / 12 : 1; // Convert inches to ft, default 1ft
    const safetyRadius = (obs.safetyBuffer || 2) + (diameter / 2);

    return (
        <group position={position} quaternion={quaternion}>
            {/* The Pipe/Obstacle */}
            <mesh>
                <cylinderGeometry args={[diameter / 2, diameter / 2, length, 16]} />
                <meshStandardMaterial color={color} opacity={0.8} transparent />
            </mesh>

            {/* Safety Ring (Warning Zone) */}
            <mesh>
                <cylinderGeometry args={[safetyRadius, safetyRadius, length, 16]} />
                <meshBasicMaterial color="red" opacity={0.1} transparent depthWrite={false} side={THREE.DoubleSide} />
            </mesh>

            <Text position={[0, diameter + 2, 0]} fontSize={5} color="white" anchorX="center" anchorY="bottom" rotation={[0, 0, 0]}>
                {obs.name}
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

const VoxelSoilLayers = () => {
    // Voxel Grid Parameters
    const gridSize = 20; // Size of each voxel cube
    const rangeX = 1000; // Total width
    const rangeZ = 1000; // Total length
    const rangeY = 100;  // Depth

    const countX = Math.ceil(rangeX / gridSize);
    const countZ = Math.ceil(rangeZ / gridSize);
    const countY = Math.ceil(rangeY / gridSize);
    const totalCount = countX * countZ * countY;

    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useEffect(() => {
        if (!meshRef.current) return;

        let i = 0;
        for (let x = 0; x < countX; x++) {
            for (let z = 0; z < countZ; z++) {
                for (let y = 0; y < countY; y++) {
                    // Position
                    const posX = (x * gridSize) - (rangeX / 2) + 500; // Center around bore
                    const posZ = (z * gridSize) - (rangeZ / 2) - 500;
                    const posY = -(y * gridSize); // Downwards

                    // Simple Soil Logic:
                    // Top 20ft: Clay (Brown)
                    // 20-60ft: Sand (Yellow)
                    // >60ft: Rock (Grey)

                    const depth = y * gridSize;
                    let color = new THREE.Color("#8B4513"); // Clay
                    if (depth > 20 && depth <= 60) color = new THREE.Color("#F4A460"); // Sand
                    if (depth > 60) color = new THREE.Color("#696969"); // Rock

                    // Random noise for "Voxel" look
                    if (Math.random() > 0.3) { // Only render 30% of blocks for "sparse" voxel look or performance
                        dummy.position.set(posX, posY, posZ);
                        dummy.scale.set(0.9, 0.9, 0.9); // Slight gap
                        dummy.updateMatrix();
                        meshRef.current.setMatrixAt(i, dummy.matrix);
                        meshRef.current.setColorAt(i, color);
                    } else {
                        // Hide this instance
                        dummy.scale.set(0, 0, 0);
                        dummy.updateMatrix();
                        meshRef.current.setMatrixAt(i, dummy.matrix);
                    }
                    i++;
                }
            }
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }, [countX, countY, countZ, dummy]);

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, totalCount]} position={[0, -10, 0]}>
            <boxGeometry args={[gridSize, gridSize, gridSize]} />
            <meshStandardMaterial transparent opacity={0.4} />
        </instancedMesh>
    );
};

const CameraController = ({ viewMode, flyThrough, stations }: { viewMode: string, flyThrough: boolean, stations: SurveyStation[] }) => {
    const { camera, controls } = useThree();
    const progress = useRef(0);

    const curve = useMemo(() => {
        if (stations.length < 2) return null;
        const points = stations.map(s => new THREE.Vector3(s.east, -s.tvd, -s.north));
        return new THREE.CatmullRomCurve3(points);
    }, [stations]);

    useEffect(() => {
        if (flyThrough) {
            progress.current = 0;
        }
    }, [flyThrough]);

    useEffect(() => {
        if (flyThrough) return;

        if (controls) {
            // @ts-ignore
            controls.target.set(500, -50, -500);
            // @ts-ignore
            controls.update();
        }

        if (viewMode === 'top') {
            camera.position.set(500, 1000, -500);
            camera.lookAt(500, 0, -500);
            camera.rotation.set(-Math.PI / 2, 0, 0);
            if (camera.type === 'OrthographicCamera') {
                camera.zoom = 0.5;
                camera.updateProjectionMatrix();
            }
        } else if (viewMode === 'side') {
            camera.position.set(500, -50, 1500);
            camera.lookAt(500, -50, -500);
            if (camera.type === 'OrthographicCamera') {
                camera.zoom = 0.5;
                camera.updateProjectionMatrix();
            }
        } else {
            camera.position.set(200, 200, 200);
            camera.lookAt(500, -50, -500);
        }
    }, [viewMode, camera, controls, flyThrough]);

    useFrame((state, delta) => {
        if (!flyThrough || !curve) return;

        const duration = 15;
        progress.current += delta / duration;

        if (progress.current >= 1) {
            progress.current = 0;
        }

        const t = progress.current;
        const position = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const lookAtT = Math.min(t + 0.05, 1);
        const lookAtPos = curve.getPointAt(lookAtT);

        const cameraPos = position.clone()
            .sub(tangent.clone().multiplyScalar(30))
            .add(new THREE.Vector3(0, 10, 0));

        camera.position.copy(cameraPos);
        camera.lookAt(lookAtPos);

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
    const [contextLost, setContextLost] = useState(false);

    return (
        <div className="h-full w-full bg-slate-900 rounded-lg overflow-hidden relative">
            {contextLost && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 text-white">
                    <div className="text-xl font-bold mb-2">3D Context Lost</div>
                    <p className="text-sm text-gray-400 mb-4">The graphics driver crashed or was reset.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                    >
                        Reload Page
                    </button>
                </div>
            )}
            <Canvas
                gl={{ powerPreference: "high-performance" }}
                onCreated={({ gl }) => {
                    const handleContextLost = (event: Event) => {
                        event.preventDefault();
                        setContextLost(true);
                        console.warn('WebGL Context Lost');
                    };
                    const handleContextRestored = () => {
                        setContextLost(false);
                        console.log('WebGL Context Restored');
                    };

                    gl.domElement.addEventListener('webglcontextlost', handleContextLost, false);
                    gl.domElement.addEventListener('webglcontextrestored', handleContextRestored, false);
                }}
            >
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
                        <VoxelSoilLayers />
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
