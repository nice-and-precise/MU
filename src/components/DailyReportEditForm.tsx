'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateDailyReport, approveDailyReport } from '@/actions/reports';
import { getInventoryItems } from '@/actions/inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Trash2, Save, CheckCircle, ShieldAlert, Users, ClipboardList, Package, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DailyReportEditFormProps {
    report: any;
    safetyMeetings?: any[];
    jsas?: any[];
    punchItems?: any[];
    inventoryTransactions?: any[];
    employees?: any[];
    assets?: any[];
}

export default function DailyReportEditForm({
    report,
    safetyMeetings = [],
    jsas = [],
    punchItems = [],
    inventoryTransactions = [],
    employees = [],
    assets = []
}: DailyReportEditFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [inventoryItems, setInventoryItems] = useState<any[]>([]);

    // Form State
    const [crew, setCrew] = useState<any[]>(JSON.parse(report.crew || '[]'));
    const [production, setProduction] = useState<any[]>(JSON.parse(report.production || '[]'));
    const [materials, setMaterials] = useState<any[]>(JSON.parse(report.materials || '[]'));
    const [equipment, setEquipment] = useState<any[]>(JSON.parse(report.equipment || '[]'));
    const [notes, setNotes] = useState(report.notes || '');
    const [weather, setWeather] = useState(report.weather || '');

    useEffect(() => {
        loadInventory();
    }, []);

    async function loadInventory() {
        const res = await getInventoryItems();
        if (res.success) {
            setInventoryItems(res.data || []);
        }
    }

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateDailyReport({
                id: report.id,
                data: {
                    crew: JSON.stringify(crew),
                    production: JSON.stringify(production),
                    materials: JSON.stringify(materials),
                    equipment: JSON.stringify(equipment),
                    notes,
                    weather
                }
            });
            router.refresh();
            alert('Report saved successfully');
        } catch (error) {
            console.error(error);
            alert('Failed to save report');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!confirm('Are you sure? This will deduct materials, log hours, and lock the report.')) return;

        setLoading(true);
        try {
            await handleSave(); // Save first to ensure latest data is used
            await approveDailyReport(report.id);
            router.refresh();
            alert('Report approved and finalized');
        } catch (error) {
            console.error(error);
            alert('Failed to approve report');
        } finally {
            setLoading(false);
        }
    };

    // Helper to add rows
    const addCrew = () => setCrew([...crew, { employeeId: '', hours: 0, role: 'Labor' }]);
    const addProduction = () => setProduction([...production, { activity: 'Drill', lf: 0, pitch: 0, azimuth: 0 }]);
    const addMaterial = () => setMaterials([...materials, { inventoryItemId: '', quantity: 0 }]);
    const addEquipment = () => setEquipment([...equipment, { assetId: '', hours: 0 }]);

    // Helper to remove rows
    const removeCrew = (idx: number) => setCrew(crew.filter((_, i) => i !== idx));
    const removeProduction = (idx: number) => setProduction(production.filter((_, i) => i !== idx));
    const removeMaterial = (idx: number) => setMaterials(materials.filter((_, i) => i !== idx));
    const removeEquipment = (idx: number) => setEquipment(equipment.filter((_, i) => i !== idx));

    const isApproved = report.status === 'APPROVED';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">{report.project.name} - {new Date(report.reportDate).toLocaleDateString()}</h2>
                    <p className="text-muted-foreground">Status: <span className="font-bold">{report.status}</span></p>
                </div>
                <div className="space-x-2">
                    <Button variant="outline" onClick={() => {
                        import('@/lib/pdf').then(mod => {
                            mod.generateDailyReportPDF(report, safetyMeetings, jsas, punchItems, inventoryTransactions);
                        });
                    }}>
                        <Download className="w-4 h-4 mr-2" /> Export PDF
                    </Button>
                    {!isApproved && (
                        <>
                            <Button variant="outline" onClick={handleSave} disabled={loading}>
                                <Save className="w-4 h-4 mr-2" /> Save Draft
                            </Button>
                            <Button onClick={handleApprove} disabled={loading} className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="w-4 h-4 mr-2" /> Approve & Finalize
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <Tabs defaultValue="report" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="report">Daily Report</TabsTrigger>
                    <TabsTrigger value="activity">Site Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="report" className="space-y-6 mt-4">
                    {/* General Info */}
                    <Card>
                        <CardHeader><CardTitle>General Information</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Weather Conditions</Label>
                                <Input value={weather} onChange={e => setWeather(e.target.value)} disabled={isApproved} />
                            </div>
                            <div>
                                <Label>Notes</Label>
                                <Textarea value={notes} onChange={e => setNotes(e.target.value)} disabled={isApproved} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Crew */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Crew Labor</CardTitle>
                            {!isApproved && <Button size="sm" variant="ghost" onClick={addCrew}><Plus className="w-4 h-4" /></Button>}
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {crew.map((member, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <Select value={member.employeeId} onValueChange={val => {
                                        const newCrew = [...crew]; newCrew[idx].employeeId = val;
                                        // Auto-set role if possible, or just keep default
                                        const emp = employees.find(e => e.id === val);
                                        if (emp) newCrew[idx].role = emp.role;
                                        setCrew(newCrew);
                                    }} disabled={isApproved}>
                                        <SelectTrigger className="flex-1"><SelectValue placeholder="Select Employee" /></SelectTrigger>
                                        <SelectContent>
                                            {employees.map(e => (
                                                <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input type="number" placeholder="Hours" className="w-24" value={member.hours} onChange={e => {
                                        const newCrew = [...crew]; newCrew[idx].hours = Number(e.target.value); setCrew(newCrew);
                                    }} disabled={isApproved} />
                                    <Select value={member.role} onValueChange={val => {
                                        const newCrew = [...crew]; newCrew[idx].role = val; setCrew(newCrew);
                                    }} disabled={isApproved}>
                                        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Foreman">Foreman</SelectItem>
                                            <SelectItem value="Operator">Operator</SelectItem>
                                            <SelectItem value="Labor">Labor</SelectItem>
                                            <SelectItem value="Driver">Driver</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {!isApproved && <Button size="icon" variant="ghost" onClick={() => removeCrew(idx)}><Trash2 className="w-4 h-4 text-red-500" /></Button>}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Equipment */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Equipment Usage</CardTitle>
                            {!isApproved && <Button size="sm" variant="ghost" onClick={addEquipment}><Plus className="w-4 h-4" /></Button>}
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {equipment.map((eq, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <Select value={eq.assetId} onValueChange={val => {
                                        const newEq = [...equipment]; newEq[idx].assetId = val; setEquipment(newEq);
                                    }} disabled={isApproved}>
                                        <SelectTrigger className="flex-1"><SelectValue placeholder="Select Asset" /></SelectTrigger>
                                        <SelectContent>
                                            {assets.map(a => (
                                                <SelectItem key={a.id} value={a.id}>{a.name} ({a.type})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input type="number" placeholder="Hours" className="w-24" value={eq.hours} onChange={e => {
                                        const newEq = [...equipment]; newEq[idx].hours = Number(e.target.value); setEquipment(newEq);
                                    }} disabled={isApproved} />
                                    {!isApproved && <Button size="icon" variant="ghost" onClick={() => removeEquipment(idx)}><Trash2 className="w-4 h-4 text-red-500" /></Button>}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Production */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Production Logs</CardTitle>
                            {!isApproved && <Button size="sm" variant="ghost" onClick={addProduction}><Plus className="w-4 h-4" /></Button>}
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {production.map((log, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <Select value={log.activity} onValueChange={val => {
                                        const newProd = [...production]; newProd[idx].activity = val; setProduction(newProd);
                                    }} disabled={isApproved}>
                                        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Drill">Drill</SelectItem>
                                            <SelectItem value="Pilot">Pilot</SelectItem>
                                            <SelectItem value="Ream">Ream</SelectItem>
                                            <SelectItem value="Pull">Pull</SelectItem>
                                            <SelectItem value="Setup">Setup</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input type="number" placeholder="LF" className="w-24" value={log.lf} onChange={e => {
                                        const newProd = [...production]; newProd[idx].lf = Number(e.target.value); setProduction(newProd);
                                    }} disabled={isApproved} />
                                    <Input type="number" placeholder="Pitch" className="w-24" value={log.pitch} onChange={e => {
                                        const newProd = [...production]; newProd[idx].pitch = Number(e.target.value); setProduction(newProd);
                                    }} disabled={isApproved} />
                                    <Input type="number" placeholder="Azimuth" className="w-24" value={log.azimuth} onChange={e => {
                                        const newProd = [...production]; newProd[idx].azimuth = Number(e.target.value); setProduction(newProd);
                                    }} disabled={isApproved} />
                                    {!isApproved && <Button size="icon" variant="ghost" onClick={() => removeProduction(idx)}><Trash2 className="w-4 h-4 text-red-500" /></Button>}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Materials */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Material Usage</CardTitle>
                            {!isApproved && <Button size="sm" variant="ghost" onClick={addMaterial}><Plus className="w-4 h-4" /></Button>}
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {materials.map((mat, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <Select value={mat.inventoryItemId} onValueChange={val => {
                                        const newMat = [...materials]; newMat[idx].inventoryItemId = val; setMaterials(newMat);
                                    }} disabled={isApproved}>
                                        <SelectTrigger className="flex-1"><SelectValue placeholder="Select Item" /></SelectTrigger>
                                        <SelectContent>
                                            {inventoryItems.map(item => (
                                                <SelectItem key={item.id} value={item.id}>{item.name} ({item.unit})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input type="number" placeholder="Qty" className="w-32" value={mat.quantity} onChange={e => {
                                        const newMat = [...materials]; newMat[idx].quantity = Number(e.target.value); setMaterials(newMat);
                                    }} disabled={isApproved} />
                                    {!isApproved && <Button size="icon" variant="ghost" onClick={() => removeMaterial(idx)}><Trash2 className="w-4 h-4 text-red-500" /></Button>}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Safety */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-orange-600" /> Safety</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-sm mb-2">Toolbox Talks</h4>
                                        {safetyMeetings.length === 0 ? <p className="text-sm text-muted-foreground">No meetings recorded today.</p> : (
                                            <ul className="space-y-2">
                                                {safetyMeetings.map(m => (
                                                    <li key={m.id} className="text-sm border p-2 rounded bg-slate-50">
                                                        <div className="font-medium">{m.topic}</div>
                                                        <div className="text-xs text-muted-foreground">{m.attendees.length} attendees</div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm mb-2">JSAs</h4>
                                        {jsas.length === 0 ? <p className="text-sm text-muted-foreground">No JSAs recorded today.</p> : (
                                            <ul className="space-y-2">
                                                {jsas.map(j => (
                                                    <li key={j.id} className="text-sm border p-2 rounded bg-slate-50">
                                                        <div className="font-medium">{j.taskDescription}</div>
                                                        <div className="text-xs text-muted-foreground">{j.hazards.length} hazards identified</div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* QC */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><ClipboardList className="w-5 h-5 text-blue-600" /> Quality Control</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <h4 className="font-semibold text-sm mb-2">Punch Items Created</h4>
                                {punchItems.length === 0 ? <p className="text-sm text-muted-foreground">No punch items created today.</p> : (
                                    <ul className="space-y-2">
                                        {punchItems.map(p => (
                                            <li key={p.id} className="text-sm border p-2 rounded bg-slate-50">
                                                <div className="font-medium">{p.title}</div>
                                                <div className="text-xs text-muted-foreground">Priority: {p.priority} | Status: {p.status}</div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>

                        {/* Inventory Transactions */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Package className="w-5 h-5 text-green-600" /> Inventory Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {inventoryTransactions.length === 0 ? <p className="text-sm text-muted-foreground">No inventory activity recorded today.</p> : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-100">
                                                <tr>
                                                    <th className="p-2">Time</th>
                                                    <th className="p-2">Item</th>
                                                    <th className="p-2">Type</th>
                                                    <th className="p-2">Qty</th>
                                                    <th className="p-2">User</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {inventoryTransactions.map(t => (
                                                    <tr key={t.id} className="border-b">
                                                        <td className="p-2">{new Date(t.createdAt).toLocaleTimeString()}</td>
                                                        <td className="p-2 font-medium">{t.item.name}</td>
                                                        <td className="p-2">
                                                            <span className={`px-2 py-1 rounded-full text-xs ${t.type === 'RESTOCK' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                {t.type}
                                                            </span>
                                                        </td>
                                                        <td className="p-2">{Math.abs(t.quantity)}</td>
                                                        <td className="p-2">{t.user.name}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
