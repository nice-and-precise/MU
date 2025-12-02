"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BigButton } from "@/components/ui/BigButton";
import { Users, UserPlus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data - in real app, fetch from DB
const AVAILABLE_EMPLOYEES = [
    { id: "1", name: "John Doe", role: "Operator", rate: 45 },
    { id: "2", name: "Jane Smith", role: "Locator", rate: 40 },
    { id: "3", name: "Bob Johnson", role: "Laborer", rate: 25 },
    { id: "4", name: "Mike Brown", role: "Laborer", rate: 25 },
    { id: "5", name: "Sarah Connor", role: "Foreman", rate: 55 },
];

const AVAILABLE_ASSETS = [
    { id: "v1", name: "Ford F-550 (Truck 101)", type: "Vehicle", rate: 35 },
    { id: "v2", name: "Ram 5500 (Truck 102)", type: "Vehicle", rate: 35 },
    { id: "e1", name: "Vermeer D24x40 (Drill)", type: "Equipment", rate: 150 },
    { id: "e2", name: "Ditch Witch JT20 (Drill)", type: "Equipment", rate: 120 },
    { id: "e3", name: "Vac-Tron (Vac)", type: "Equipment", rate: 85 },
];

const ACTIVE_PROJECTS = [
    { id: "p1", name: "Fiber Install - Willmar" },
    { id: "p2", name: "Water Main - Spicer" },
    { id: "p3", name: "Emergency Repair - Hwy 12" },
];

interface CrewDispatchProps {
    variant?: "default" | "owner";
}

export function CrewDispatch({ variant = "default" }: CrewDispatchProps) {
    const [crewMembers, setCrewMembers] = useState<typeof AVAILABLE_EMPLOYEES>([]);
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [selectedRole, setSelectedRole] = useState("");

    // Owner specific state
    const [selectedAssets, setSelectedAssets] = useState<typeof AVAILABLE_ASSETS>([]);
    const [selectedAssetId, setSelectedAssetId] = useState("");
    const [selectedProject, setSelectedProject] = useState("");
    const [isHighPriority, setIsHighPriority] = useState(false);

    function addMember() {
        if (!selectedEmployee) return;
        const employee = AVAILABLE_EMPLOYEES.find(e => e.id === selectedEmployee);
        if (employee && !crewMembers.find(m => m.id === employee.id)) {
            const memberWithRole = { ...employee, role: selectedRole || employee.role };
            setCrewMembers([...crewMembers, memberWithRole]);
        }
        setSelectedEmployee("");
        setSelectedRole("");
    }

    function removeMember(id: string) {
        setCrewMembers(crewMembers.filter(m => m.id !== id));
    }

    function addAsset() {
        if (!selectedAssetId) return;
        const asset = AVAILABLE_ASSETS.find(a => a.id === selectedAssetId);
        if (asset && !selectedAssets.find(a => a.id === asset.id)) {
            setSelectedAssets([...selectedAssets, asset]);
        }
        setSelectedAssetId("");
    }

    function removeAsset(id: string) {
        setSelectedAssets(selectedAssets.filter(a => a.id !== id));
    }

    const totalHourlyRate = React.useMemo(() => {
        const laborCost = crewMembers.reduce((acc, m) => acc + m.rate, 0);
        const assetCost = selectedAssets.reduce((acc, a) => acc + a.rate, 0);
        return laborCost + assetCost;
    }, [crewMembers, selectedAssets]);

    function handleDispatch() {
        if (crewMembers.length === 0) {
            alert("Add crew members first.");
            return;
        }
        if (variant === "owner" && !selectedProject) {
            alert("Please select a project.");
            return;
        }

        const dispatchData = {
            crew: crewMembers,
            assets: selectedAssets,
            project: selectedProject,
            priority: isHighPriority,
            estimatedDailyCost: totalHourlyRate * 10 // Assuming 10h day
        };

        console.log("Dispatching:", dispatchData);
        alert(`Dispatched crew to ${variant === "owner" ? ACTIVE_PROJECTS.find(p => p.id === selectedProject)?.name : "site"}! Est. Daily Cost: $${dispatchData.estimatedDailyCost}`);
    }

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-6 w-6" />
                        {variant === "owner" ? "Advanced Crew Dispatch" : "Crew Dispatch"}
                    </div>
                    {variant === "owner" && (
                        <div className="text-sm font-normal bg-green-100 text-green-800 px-3 py-1 rounded-full">
                            Est. Run Rate: <span className="font-bold">${totalHourlyRate}/hr</span>
                        </div>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Project & Priority (Owner Only) */}
                {variant === "owner" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="space-y-2">
                            <Label>Target Project</Label>
                            <Select value={selectedProject} onValueChange={setSelectedProject}>
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Select Project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ACTIVE_PROJECTS.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-2 pt-8">
                            <input
                                type="checkbox"
                                id="priority"
                                checked={isHighPriority}
                                onChange={(e) => setIsHighPriority(e.target.checked)}
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <Label htmlFor="priority" className="font-bold text-red-600">High Priority Dispatch</Label>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Crew Selection */}
                    <div className="space-y-6">
                        <h3 className="font-bold text-lg border-b pb-2">Crew Members</h3>
                        <div className="flex gap-2 items-end">
                            <div className="flex-1 space-y-2">
                                <Label>Employee</Label>
                                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Employee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {AVAILABLE_EMPLOYEES.filter(e => !crewMembers.find(m => m.id === e.id)).map(e => (
                                            <SelectItem key={e.id} value={e.id}>{e.name} - {e.role}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-1/3 space-y-2">
                                <Label>Role</Label>
                                <Select value={selectedRole} onValueChange={setSelectedRole}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Default" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Foreman">Foreman</SelectItem>
                                        <SelectItem value="Operator">Operator</SelectItem>
                                        <SelectItem value="Locator">Locator</SelectItem>
                                        <SelectItem value="Laborer">Laborer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <BigButton icon={UserPlus} onClick={addMember} className="py-2" label="" fullWidth={false} />
                        </div>

                        <div className="space-y-2">
                            {crewMembers.map(member => (
                                <div key={member.id} className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm">
                                    <div>
                                        <div className="font-bold">{member.name}</div>
                                        <div className="text-xs text-muted-foreground">{member.role} • ${member.rate}/hr</div>
                                    </div>
                                    <button onClick={() => removeMember(member.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            {crewMembers.length === 0 && <p className="text-sm text-muted-foreground italic text-center py-4">No crew assigned</p>}
                        </div>
                    </div>

                    {/* Asset Selection (Owner Only) */}
                    {variant === "owner" && (
                        <div className="space-y-6">
                            <h3 className="font-bold text-lg border-b pb-2">Assets & Equipment</h3>
                            <div className="flex gap-2 items-end">
                                <div className="flex-1 space-y-2">
                                    <Label>Asset</Label>
                                    <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Asset" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {AVAILABLE_ASSETS.filter(a => !selectedAssets.find(sa => sa.id === a.id)).map(a => (
                                                <SelectItem key={a.id} value={a.id}>{a.name} ({a.type})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <BigButton icon={UserPlus} onClick={addAsset} className="py-2" label="" fullWidth={false} />
                            </div>

                            <div className="space-y-2">
                                {selectedAssets.map(asset => (
                                    <div key={asset.id} className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm">
                                        <div>
                                            <div className="font-bold">{asset.name}</div>
                                            <div className="text-xs text-muted-foreground">{asset.type} • ${asset.rate}/hr</div>
                                        </div>
                                        <button onClick={() => removeAsset(asset.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {selectedAssets.length === 0 && <p className="text-sm text-muted-foreground italic text-center py-4">No assets assigned</p>}
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t">
                    <BigButton
                        label={variant === "owner" ? `DISPATCH CREW & ASSETS` : "DISPATCH CREW"}
                        icon={Users}
                        onClick={handleDispatch}
                        className="bg-[#003366] hover:bg-[#002244] text-white w-full"
                    />
                    {variant === "owner" && (
                        <p className="text-center text-xs text-muted-foreground mt-2">
                            *Estimated daily cost based on 10-hour shift: <strong>${(totalHourlyRate * 10).toLocaleString()}</strong>
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

