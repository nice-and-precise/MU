"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BigButton } from "@/components/ui/BigButton";
import { Users, UserPlus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Employee, Asset, Project } from "@prisma/client";
import { dispatchCrew } from "@/actions/staff";

interface CrewDispatchProps {
    variant?: "default" | "owner";
    employees: Employee[];
    assets: Asset[];
    projects: Project[];
}

export function CrewDispatch({ variant = "default", employees, assets, projects }: CrewDispatchProps) {
    // Local state for the crew being built
    const [crewMembers, setCrewMembers] = useState<(Employee & { role: string })[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [selectedRole, setSelectedRole] = useState("");

    // Owner specific state
    const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
    const [selectedAssetId, setSelectedAssetId] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [isHighPriority, setIsHighPriority] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    function addMember() {
        if (!selectedEmployeeId) return;
        const employee = employees.find(e => e.id === selectedEmployeeId);
        if (employee && !crewMembers.find(m => m.id === employee.id)) {
            const memberWithRole = { ...employee, role: selectedRole || employee.role };
            setCrewMembers([...crewMembers, memberWithRole]);
        }
        setSelectedEmployeeId("");
        setSelectedRole("");
    }

    function removeMember(id: string) {
        setCrewMembers(crewMembers.filter(m => m.id !== id));
    }

    function addAsset() {
        if (!selectedAssetId) return;
        const asset = assets.find(a => a.id === selectedAssetId);
        if (asset && !selectedAssets.find(a => a.id === asset.id)) {
            setSelectedAssets([...selectedAssets, asset]);
        }
        setSelectedAssetId("");
    }

    function removeAsset(id: string) {
        setSelectedAssets(selectedAssets.filter(a => a.id !== id));
    }

    const totalHourlyRate = useMemo(() => {
        const laborCost = crewMembers.reduce((acc, m) => acc + (m.hourlyRate || 0), 0);
        const assetCost = selectedAssets.reduce((acc, a) => acc + (a.hourlyRate || 0), 0);
        return laborCost + assetCost;
    }, [crewMembers, selectedAssets]);

    async function handleDispatch() {
        if (crewMembers.length === 0) {
            alert("Add crew members first.");
            return;
        }
        if (variant === "owner" && !selectedProjectId) {
            alert("Please select a project.");
            return;
        }

        setIsSubmitting(true);

        const dispatchData = {
            crew: crewMembers.map(m => ({ id: m.id, role: m.role })),
            assets: selectedAssets.map(a => a.id),
            projectId: selectedProjectId,
            priority: isHighPriority,
            estimatedDailyCost: totalHourlyRate * 10 // Assuming 10h day
        };

        try {
            const res = await dispatchCrew(dispatchData);
            if (res.success) {
                alert(`Dispatched crew successfully!`);
                setCrewMembers([]);
                setSelectedAssets([]);
                setSelectedProjectId("");
            } else {
                alert("Failed to dispatch: " + res.error);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred during dispatch.");
        } finally {
            setIsSubmitting(false);
        }
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
                            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Select Project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map(p => (
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
                                <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Employee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.filter(e => !crewMembers.find(m => m.id === e.id)).map(e => (
                                            <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName} - {e.role}</SelectItem>
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
                                        <div className="font-bold">{member.firstName} {member.lastName}</div>
                                        <div className="text-xs text-muted-foreground">{member.role} • ${member.hourlyRate}/hr</div>
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
                                            {assets.filter(a => !selectedAssets.find(sa => sa.id === a.id)).map(a => (
                                                <SelectItem key={a.id} value={a.id}>{a.name} ({a.type})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-1/3">
                                    <BigButton icon={UserPlus} onClick={addAsset} className="py-2 w-full" label="" fullWidth={false} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                {selectedAssets.map(asset => (
                                    <div key={asset.id} className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm">
                                        <div>
                                            <div className="font-bold">{asset.name}</div>
                                            <div className="text-xs text-muted-foreground">{asset.type} • ${asset.hourlyRate}/hr</div>
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
                        label={isSubmitting ? "DISPATCHING..." : (variant === "owner" ? `DISPATCH CREW & ASSETS` : "DISPATCH CREW")}
                        icon={Users}
                        onClick={handleDispatch}
                        disabled={isSubmitting}
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
