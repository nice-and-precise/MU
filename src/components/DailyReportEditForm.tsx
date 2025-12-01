'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateDailyReport, approveDailyReport } from '@/app/actions/reports';
import { getInventoryItems } from '@/actions/inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Trash2, Save, CheckCircle } from 'lucide-react';

interface DailyReportEditFormProps {
    report: any;
}

export default function DailyReportEditForm({ report }: DailyReportEditFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [inventoryItems, setInventoryItems] = useState<any[]>([]);

    // Form State
    const [crew, setCrew] = useState<any[]>(JSON.parse(report.crew || '[]'));
    const [production, setProduction] = useState<any[]>(JSON.parse(report.production || '[]'));
    const [materials, setMaterials] = useState<any[]>(JSON.parse(report.materials || '[]'));
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
            await updateDailyReport(report.id, {
                crew: JSON.stringify(crew),
                production: JSON.stringify(production),
                materials: JSON.stringify(materials),
                notes,
                weather
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
        if (!confirm('Are you sure? This will deduct materials from inventory and lock the report.')) return;

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
    const addCrew = () => setCrew([...crew, { name: '', hours: 0, role: 'Labor' }]);
    const addProduction = () => setProduction([...production, { activity: 'Drill', lf: 0, pitch: 0, azimuth: 0 }]);
    const addMaterial = () => setMaterials([...materials, { inventoryItemId: '', quantity: 0 }]);

    // Helper to remove rows
    const removeCrew = (idx: number) => setCrew(crew.filter((_, i) => i !== idx));
    const removeProduction = (idx: number) => setProduction(production.filter((_, i) => i !== idx));
    const removeMaterial = (idx: number) => setMaterials(materials.filter((_, i) => i !== idx));

    const isApproved = report.status === 'APPROVED';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">{report.project.name} - {new Date(report.reportDate).toLocaleDateString()}</h2>
                    <p className="text-muted-foreground">Status: <span className="font-bold">{report.status}</span></p>
                </div>
                <div className="space-x-2">
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
                    <CardTitle>Crew</CardTitle>
                    {!isApproved && <Button size="sm" variant="ghost" onClick={addCrew}><Plus className="w-4 h-4" /></Button>}
                </CardHeader>
                <CardContent className="space-y-2">
                    {crew.map((member, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                            <Input placeholder="Name" value={member.name} onChange={e => {
                                const newCrew = [...crew]; newCrew[idx].name = e.target.value; setCrew(newCrew);
                            }} disabled={isApproved} />
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
        </div>
    );
}
