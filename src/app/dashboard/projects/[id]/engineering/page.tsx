
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getProject } from '@/app/actions/projects';
import { getBoreEngineering, upsertBorePlan, upsertFluidPlan } from '@/actions/engineering';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Droplets, ArrowRight, Box, LineChart } from 'lucide-react';
import Bore3DView from '@/components/visualization/Bore3DView';
import FracChart from '@/components/engineering/FracChart';
import { calculateRequiredPressure, calculateDelftPMax, getSoilProperties, FluidProperties, BoreholeGeometry } from '@/lib/drilling/math/hydraulics';

export default function EngineeringPage() {
    const params = useParams();
    const projectId = params.id as string;
    const [project, setProject] = useState<any>(null);
    const [selectedBoreId, setSelectedBoreId] = useState<string | null>(null);
    const [engineeringData, setEngineeringData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [fracData, setFracData] = useState<any[]>([]);

    // Form states
    const [borePlan, setBorePlan] = useState({
        designMethod: 'ASTM F1962',
        pipeDiameter: 0,
        pipeMaterial: 'HDPE',
        totalLength: 0,
        safetyFactor: 1.5,
    });

    const [fluidPlan, setFluidPlan] = useState({
        soilType: 'Clay',
        pumpRate: 50,
        fluidType: 'Bentonite',
        cleaningRate: 1.5, // Annular velocity target
    });

    useEffect(() => {
        loadProject();
    }, [projectId]);

    useEffect(() => {
        if (selectedBoreId) {
            loadEngineeringData(selectedBoreId);
        }
    }, [selectedBoreId]);

    async function loadProject() {
        const p = await getProject(projectId);
        setProject(p);
        if (p && p.bores.length > 0) {
            setSelectedBoreId(p.bores[0].id);
        }
        setLoading(false);
    }

    async function loadEngineeringData(boreId: string) {
        const res = await getBoreEngineering(boreId);
        if (res?.data) {
            setEngineeringData(res.data);
            setBorePlan({
                designMethod: res.data.designMethod || 'ASTM F1962',
                pipeDiameter: res.data.pipeDiameter,
                pipeMaterial: res.data.pipeMaterial,
                totalLength: res.data.totalLength,
                safetyFactor: res.data.safetyFactor || 1.5,
            });
            if (res.data.fluidPlan) {
                setFluidPlan({
                    soilType: res.data.fluidPlan.soilType,
                    pumpRate: res.data.fluidPlan.pumpRate || 50,
                    fluidType: res.data.fluidPlan.fluidType || 'Bentonite',
                    cleaningRate: res.data.fluidPlan.cleaningRate || 1.5,
                });
                // Calculate chart data if we have enough info
                calculatePressures(res.data.totalLength, res.data.pipeDiameter, res.data.fluidPlan);
            }
        } else {
            // Reset to defaults or pull from Bore basic info if available
            const bore = project.bores.find((b: any) => b.id === boreId);
            setBorePlan({
                designMethod: 'ASTM F1962',
                pipeDiameter: bore?.diameterIn || 0,
                pipeMaterial: bore?.productMaterial || 'HDPE',
                totalLength: bore?.totalLength || 0,
                safetyFactor: 1.5,
            });
            setEngineeringData(null);
            setFracData([]);
        }
    }

    async function handleSaveBorePlan() {
        if (!selectedBoreId) return;
        await upsertBorePlan({
            boreId: selectedBoreId,
            ...borePlan,
        });
        loadEngineeringData(selectedBoreId);
    }

    async function handleSaveFluidPlan() {
        if (!selectedBoreId || !engineeringData) return;

        // Calculate volumes locally for immediate feedback (also done on server)
        // Hole Volume = pi * (r_hole)^2 * length
        // Assume hole is 1.5x pipe
        const holeDiamIn = borePlan.pipeDiameter * 1.5;
        const holeVolGalPerFt = (Math.PI * Math.pow(holeDiamIn / 2 / 12, 2)) * 7.48;
        const totalVol = holeVolGalPerFt * borePlan.totalLength * fluidPlan.cleaningRate; // Apply safety/cleaning factor

        await upsertFluidPlan({
            borePlanId: engineeringData.id,
            ...fluidPlan,
            volumePerFt: holeVolGalPerFt,
            totalVolume: totalVol,
        });
        loadEngineeringData(selectedBoreId);
    }

    function calculatePressures(length: number, pipeDiam: number, fluid: any) {
        if (!length || !pipeDiam) return;

        const points = [];
        const steps = 20;
        const stepSize = length / steps;
        const holeDiam = pipeDiam * 1.5;

        // Fluid Properties (Approximation based on type)
        const fluidProps: FluidProperties = {
            density: 9.0, // ppg
            viscosity: 15, // cP
            yieldPoint: 20 // lb/100ft2
        };

        // Soil Layer (Mock for now, should come from Geotech)
        const soilLayer = {
            startDepth: 0,
            endDepth: 1000,
            soilType: fluid.soilType || 'Clay',
            hardness: 1
        };

        for (let i = 0; i <= steps; i++) {
            const l = i * stepSize;
            // Simple depth profile: Entry (0) -> Deepest (Length/5) -> Exit (0)
            // Parabolic profile
            const depth = 4 * (length / 10) * (l / length) * (1 - l / length);

            const geo: BoreholeGeometry = {
                holeDiameterIn: holeDiam,
                pipeDiameterIn: pipeDiam,
                lengthFt: l,
                depthFt: depth
            };

            const pReq = calculateRequiredPressure(fluidProps, geo, fluid.pumpRate || 50);
            const soilProps = getSoilProperties(soilLayer, depth);
            const pMax = calculateDelftPMax(depth, soilProps, holeDiam);
            const hydrostatic = 0.052 * fluidProps.density * depth;

            points.push({
                depth: depth,
                hydrostatic: hydrostatic,
                pReq: pReq,
                pMax: pMax
            });
        }
        setFracData(points);
    }

    if (loading) return <div className="p-8">Loading...</div>;
    if (!project) return <div className="p-8">Project not found</div>;

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Engineering & Planning</h1>
                    <p className="text-muted-foreground">Bore design, pullback calculations, and fluid planning.</p>
                </div>
                <div className="w-[300px]">
                    <Label>Select Bore</Label>
                    <Select value={selectedBoreId || ''} onValueChange={setSelectedBoreId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Choose a bore..." />
                        </SelectTrigger>
                        <SelectContent>
                            {project.bores.map((b: any) => (
                                <SelectItem key={b.id} value={b.id}>
                                    {b.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {selectedBoreId ? (
                <Tabs defaultValue="design" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="design">Bore Design</TabsTrigger>
                        <TabsTrigger value="fluids">Fluid Plan</TabsTrigger>
                        <TabsTrigger value="3d">3D Visualization</TabsTrigger>
                    </TabsList>

                    <TabsContent value="design">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Calculator className="mr-2 h-5 w-5" /> Design Parameters
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Total Length (ft)</Label>
                                            <Input
                                                type="number"
                                                value={borePlan.totalLength}
                                                onChange={(e) => setBorePlan({ ...borePlan, totalLength: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Pipe Diameter (in)</Label>
                                            <Input
                                                type="number"
                                                value={borePlan.pipeDiameter}
                                                onChange={(e) => setBorePlan({ ...borePlan, pipeDiameter: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Material</Label>
                                            <Select
                                                value={borePlan.pipeMaterial}
                                                onValueChange={(val) => setBorePlan({ ...borePlan, pipeMaterial: val })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="HDPE">HDPE</SelectItem>
                                                    <SelectItem value="Steel">Steel</SelectItem>
                                                    <SelectItem value="PVC">PVC</SelectItem>
                                                    <SelectItem value="Ductile Iron">Ductile Iron</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Safety Factor</Label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                value={borePlan.safetyFactor}
                                                onChange={(e) => setBorePlan({ ...borePlan, safetyFactor: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <Button onClick={handleSaveBorePlan} className="w-full">
                                        Calculate Loads
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Calculated Loads
                                        {engineeringData?.notes ? (
                                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                                                ({engineeringData.notes})
                                            </span>
                                        ) : (
                                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                                                (ASTM F1962)
                                            </span>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {engineeringData ? (
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <span className="text-sm font-medium">Estimated Pullback Force</span>
                                                <span className="text-2xl font-bold text-blue-600">
                                                    {Math.round(engineeringData.pullbackForce || 0).toLocaleString()} lbs
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Pipe Tensile Strength</span>
                                                    <span>120,000 lbs</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Rig Capacity Required</span>
                                                    <span>{Math.round((engineeringData.pullbackForce || 0) * 1.1).toLocaleString()} lbs</span>
                                                </div>
                                            </div>
                                            {/* Visual indicator */}
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>Load</span>
                                                    <span>Capacity</span>
                                                </div>
                                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500"
                                                        style={{ width: `${Math.min(((engineeringData.pullbackForce || 0) / 120000) * 100, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                                            <p>Enter parameters and calculate to see results.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="fluids">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Droplets className="mr-2 h-5 w-5" /> Fluid Plan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <Label>Primary Soil Type</Label>
                                            <Select
                                                value={fluidPlan.soilType}
                                                onValueChange={(val) => setFluidPlan({ ...fluidPlan, soilType: val })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Clay">Clay (Reactive)</SelectItem>
                                                    <SelectItem value="Sand">Sand (Porous)</SelectItem>
                                                    <SelectItem value="Rock">Rock</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">
                                                *Calculations now use detailed Geotech Layers if available.
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Pump Rate (gpm)</Label>
                                                <Input
                                                    type="number"
                                                    value={fluidPlan.pumpRate}
                                                    onChange={(e) => setFluidPlan({ ...fluidPlan, pumpRate: parseFloat(e.target.value) })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Hole Cleaning Ratio</Label>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    value={fluidPlan.cleaningRate}
                                                    onChange={(e) => setFluidPlan({ ...fluidPlan, cleaningRate: parseFloat(e.target.value) })}
                                                    title="Multiplier for hole volume (e.g. 1.5 - 3.0)"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <Button onClick={handleSaveFluidPlan} disabled={!engineeringData} className="w-full">
                                        Calculate Volumes
                                    </Button>
                                    {!engineeringData && <p className="text-xs text-red-500 text-center">Save Bore Design first.</p>}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Fluid Requirements</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {engineeringData?.fluidPlan ? (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Volume</p>
                                                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                                        {Math.round(engineeringData.fluidPlan.totalVolume || 0).toLocaleString()}
                                                        <span className="text-sm font-normal text-muted-foreground ml-1">gal</span>
                                                    </p>
                                                </div>
                                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Vol / Foot</p>
                                                    <p className="text-2xl font-bold">
                                                        {(engineeringData.fluidPlan.volumePerFt || 0).toFixed(2)}
                                                        <span className="text-sm font-normal text-muted-foreground ml-1">gal/ft</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="font-medium text-sm">Recommended Mix</h4>
                                                <div className="p-3 border rounded-md text-sm space-y-2">
                                                    {fluidPlan.soilType === 'Clay' && (
                                                        <>
                                                            <div className="flex justify-between">
                                                                <span>Bentonite</span>
                                                                <span>25 lbs / 100 gal</span>
                                                            </div>
                                                            <div className="flex justify-between text-yellow-600 font-medium">
                                                                <span>PHPA Polymer (Inhibitor)</span>
                                                                <span>Required</span>
                                                            </div>
                                                        </>
                                                    )}
                                                    {fluidPlan.soilType === 'Sand' && (
                                                        <>
                                                            <div className="flex justify-between">
                                                                <span>Bentonite</span>
                                                                <span>45 lbs / 100 gal</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>PAC (Filtration Control)</span>
                                                                <span>Recommended</span>
                                                            </div>
                                                        </>
                                                    )}
                                                    {fluidPlan.soilType === 'Rock' && (
                                                        <>
                                                            <div className="flex justify-between">
                                                                <span>Bentonite</span>
                                                                <span>35 lbs / 100 gal</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>Xanthan Gum (Suspension)</span>
                                                                <span>Recommended</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Frac-Out Risk Display */}
                                            <div className="mt-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
                                                <h4 className="font-semibold mb-2 flex items-center">
                                                    Hydro-Fracture Risk Analysis
                                                </h4>
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm text-muted-foreground">
                                                        Calculated Risk Level based on Annular Pressure vs. Soil Strength
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full font-bold text-white ${engineeringData?.fracOutRisk === 'CRITICAL' ? 'bg-red-600' :
                                                        engineeringData?.fracOutRisk === 'HIGH' ? 'bg-orange-500' :
                                                            'bg-green-500'
                                                        }`}>
                                                        {engineeringData?.fracOutRisk || 'LOW'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                                            <p>Calculate fluid plan to see requirements.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Fracture Chart */}
                        {fracData.length > 0 && (
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <LineChart className="mr-2 h-5 w-5" /> Downhole Pressure Analysis
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="h-[400px]">
                                    <FracChart data={fracData} />
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="3d">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Box className="mr-2 h-5 w-5" /> 3D Bore Visualization
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Bore3DView
                                    length={borePlan.totalLength || 500}
                                    diameter={borePlan.pipeDiameter || 6}
                                    entryAngle={12} // Default for now
                                // We could pass soil layers here if we fetched them
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl text-muted-foreground">
                    <ArrowRight className="h-8 w-8 mb-4 opacity-20" />
                    <p>Select a bore to begin engineering planning.</p>
                </div>
            )}
        </div>
    );
}
