"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BigButton } from "@/components/ui/BigButton";
import { Users, UserPlus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Employee, Asset, Project } from "@prisma/client";
import { dispatchCrew } from "@/actions/crews";

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
    const [jobType, setJobType] = useState("Bore"); // Default job type
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
            jobType, // Pass job type
            estimatedDailyCost: totalHourlyRate * 10
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

    function handleNotifyCrew() {
        alert("Notification sent to all assigned crew members via SMS and Email.");
    }

    return (
        <Card className="max-w-4xl mx-auto shadow-lg border-t-4 border-t-[#003366] bg-white dark:bg-slate-900">
            <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#003366] dark:text-blue-400">
                        <Users className="h-6 w-6" />
                        {variant === "owner" ? "Advanced Crew Dispatch" : "Crew Dispatch"}
                    </div>
                    {variant === "owner" && (
                        <div className="flex items-center gap-4">
                            <div className="text-sm font-normal bg-green-100 text-green-800 px-3 py-1 rounded-full border border-green-200 shadow-sm">
                                Est. Run Rate: <span className="font-bold">${totalHourlyRate}/hr</span>
                            </div>
                        </div>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-6">
                {/* Project & Priority (Owner Only) */}
                {variant === "owner" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <div className="space-y-2">
                            <Label className="font-semibold text-blue-900 dark:text-blue-100">Target Project</Label>
                            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                <SelectTrigger className="bg-white dark:bg-slate-950 border-blue-200 dark:border-blue-800">
                                    <SelectValue placeholder="Select Project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold text-blue-900 dark:text-blue-100">Job Type</Label>
                            <Select value={jobType} onValueChange={setJobType}>
                                <SelectTrigger className="bg-white dark:bg-slate-950 border-blue-200 dark:border-blue-800">
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Bore">Directional Bore</SelectItem>
                                    <SelectItem value="Pothole">Vacuum Potholing</SelectItem>
                                    <SelectItem value="Restoration">Restoration / Sod</SelectItem>
                                    <SelectItem value="Fiber">Fiber Blowing</SelectItem>
                                    <SelectItem value="Emergency">Emergency Repair</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-3 pt-8">
                            <input
                                type="checkbox"
                                id="priority"
                                checked={isHighPriority}
                                onChange={(e) => setIsHighPriority(e.target.checked)}
                                className="h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <Label htmlFor="priority" className="font-bold text-red-600 dark:text-red-400 cursor-pointer">High Priority Dispatch</Label>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Crew Selection */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">Crew Members</h3>
                            <span className="text-xs font-medium text-muted-foreground bg-slate-100 px-2 py-1 rounded-full">{crewMembers.length} Assigned</span>
                        </div>

                        <div className="flex flex-col md:flex-row gap-2 items-end bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border dark:border-slate-700">
                            <div className="w-full md:flex-1 space-y-2">
                                <Label className="text-xs uppercase text-muted-foreground font-bold">Employee</Label>
                                <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                                    <SelectTrigger className="bg-white dark:bg-slate-950">
                                        <SelectValue placeholder="Select Employee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.filter(e => !crewMembers.find(m => m.id === e.id)).map(e => (
                                            <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName} - {e.role}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full md:w-1/3 space-y-2">
                                <Label className="text-xs uppercase text-muted-foreground font-bold">Role</Label>
                                <Select value={selectedRole} onValueChange={setSelectedRole}>
                                    <SelectTrigger className="bg-white dark:bg-slate-950">
                                        <SelectValue placeholder="Default" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Foreman">Foreman</SelectItem>
                                        <SelectItem value="Operator">Operator</SelectItem>
                                        <SelectItem value="Locator">Locator</SelectItem>
                                        <SelectItem value="Laborer">Laborer</SelectItem>
                                        <SelectItem value="Mechanic">Mechanic</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full md:w-auto">
                                <BigButton icon={UserPlus} onClick={addMember} className="py-2 h-10 w-full md:w-auto" label="" fullWidth={false} />
                            </div>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {crewMembers.map(member => (
                                <div key={member.id} className="flex items-center justify-between p-4 bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white ${member.role === 'FOREMAN' ? 'bg-blue-600' :
                                            member.role === 'OPERATOR' ? 'bg-orange-500' : 'bg-slate-500'
                                            }`}>
                                            {member.firstName[0]}{member.lastName[0]}
                                        </div>
                                        <div>
                                            <div className="font-bold text-black dark:text-white">{member.firstName} {member.lastName}</div>
                                            <div className="text-xs text-gray-900 dark:text-gray-300 flex items-center gap-2">
                                                <span className="bg-slate-200 px-1.5 py-0.5 rounded text-black font-bold border border-slate-300">{member.role}</span>
                                                <span className="text-black font-bold">•</span>
                                                <span className="font-bold text-black dark:text-white">${member.hourlyRate}/hr</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => removeMember(member.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                            {crewMembers.length === 0 && (
                                <div className="text-center py-8 border-2 border-dashed rounded-xl bg-slate-50/50 dark:bg-slate-800/50 dark:border-slate-700">
                                    <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-50" />
                                    <p className="text-sm text-muted-foreground">No crew members assigned yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Asset Selection (Owner Only) */}
                    {variant === "owner" && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">Assets & Equipment</h3>
                                <span className="text-xs font-medium text-muted-foreground bg-slate-100 px-2 py-1 rounded-full">{selectedAssets.length} Assigned</span>
                            </div>

                            <div className="flex flex-col md:flex-row gap-2 items-end bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border dark:border-slate-700">
                                <div className="w-full md:flex-1 space-y-2">
                                    <Label className="text-xs uppercase text-muted-foreground font-bold">Asset</Label>
                                    <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                                        <SelectTrigger className="bg-white dark:bg-slate-950">
                                            <SelectValue placeholder="Select Asset" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {assets.filter(a => !selectedAssets.find(sa => sa.id === a.id)).map(a => (
                                                <SelectItem key={a.id} value={a.id}>{a.name} ({a.type})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-full md:w-1/3">
                                    <BigButton icon={UserPlus} onClick={addAsset} className="py-2 h-10 w-full" label="" fullWidth={false} />
                                </div>
                            </div>

                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                {selectedAssets.map(asset => (
                                    <div key={asset.id} className="flex items-center justify-between p-4 bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow group">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center font-bold text-yellow-700">
                                                {asset.type[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{asset.name}</div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">{asset.type}</span>
                                                    <span>•</span>
                                                    <span>${asset.hourlyRate}/hr</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => removeAsset(asset.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                                {selectedAssets.length === 0 && (
                                    <div className="text-center py-8 border-2 border-dashed rounded-xl bg-slate-50/50 dark:bg-slate-800/50 dark:border-slate-700">
                                        <p className="text-sm text-muted-foreground">No assets assigned yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-6 border-t flex gap-4">
                    <BigButton
                        label={isSubmitting ? "DISPATCHING..." : (variant === "owner" ? `DISPATCH CREW & ASSETS` : "DISPATCH CREW")}
                        icon={Users}
                        onClick={handleDispatch}
                        disabled={isSubmitting}
                        className="bg-[#003366] hover:bg-[#002244] text-white flex-1 shadow-lg shadow-blue-900/20"
                    />
                    {variant === "owner" && (
                        <button
                            onClick={handleNotifyCrew}
                            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            NOTIFY CREW
                        </button>
                    )}
                </div>
                {variant === "owner" && (
                    <p className="text-center text-xs text-muted-foreground">
                        *Estimated daily cost based on 10-hour shift: <strong>${(totalHourlyRate * 10).toLocaleString()}</strong>
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
