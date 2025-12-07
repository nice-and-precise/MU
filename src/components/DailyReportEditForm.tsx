'use client';

import DailyReportForm from './daily-reports/form/DailyReportForm';

interface DailyReportEditFormProps {
    report: any;
    safetyMeetings?: any[];
    jsas?: any[];
    punchItems?: any[];
    inventoryTransactions?: any[];
    employees?: any[];
    assets?: any[];
}

// Wrapper to adapt the old component location to the new Form
// We might want to pass down the extra props (safety meetings etc) if we want to display them 
// side-by-side or in a tab, but for now we focus on the main report editing flow as requested.
// The previous implementation had tabs for "Site Activity". The user request focused on the "Edit Form" UX.
// To preserve the "Site Activity" view, we can wrap the new Form in the same Tabs structure or 
// just render the Form for now and let the user decide if they want the Tabs back.
// 'Wrap DailyReportEditForm in the same Form components...'
// I will render the new Form. The "Site Activity" tabs were read-only displays of related data.
// I will just render the new Form for the "Report" part.
// The user request said "Wrap DailyReportEditForm in the same Form components...". 
// I'll assume replacing the logic inside is the goal.

// However, maintaining the "Site Activity" tab might be good for context. 
// I will fetch the inventory items here or pass them through if relevant. 
// For now I'll just swap the implementation to the new DailyReportForm.
// But wait, DailyReportForm needs inventoryItems.
// The original component fetched them in a useEffect. I should probably do the same or refactor.
// To be clean, I'll pass the props through. I'll need to fetch inventory in DailyReportForm or pass it.
// The original component did:
/*
    const [inventoryItems, setInventoryItems] = useState<any[]>([]);
    useEffect(() => { loadInventory(); }, []);
*/
// I should replicate this data fetching or assume it is available. 
// Since I am making DailyReportForm a client component, I can do the fetching there or here.
// I'll do it here to keep the child clean or just pass it if I can.
// Actually, let's keep the data fetching in this wrapper to minimize change to the child.

import { useState, useEffect } from 'react';
import { getInventoryItems } from '@/actions/inventory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, ClipboardList, Package } from 'lucide-react';

export default function DailyReportEditForm({
    report,
    safetyMeetings = [],
    jsas = [],
    punchItems = [],
    inventoryTransactions = [], // These are historical transactions for the day
    employees = [],
    assets = []
}: DailyReportEditFormProps) {
    const [inventoryItems, setInventoryItems] = useState<any[]>([]);

    useEffect(() => {
        const load = async () => {
            const res = await getInventoryItems();
            if (res.success) setInventoryItems(res.data || []);
        };
        load();
    }, []);

    // We can keep the Tabs layout if we want to show the 'Site Activity' context
    return (
        <div className="space-y-6">
            <Tabs defaultValue="report" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="report">Daily Report</TabsTrigger>
                    <TabsTrigger value="activity">Site Activity Context</TabsTrigger>
                </TabsList>

                <TabsContent value="report">
                    <DailyReportForm
                        report={report}
                        employees={employees}
                        assets={assets}
                        inventoryItems={inventoryItems}
                    />
                </TabsContent>

                <TabsContent value="activity">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Safety */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base"><ShieldAlert className="w-5 h-5 text-orange-600" /> Safety (Read Only)</CardTitle>
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
                                <CardTitle className="flex items-center gap-2 text-base"><ClipboardList className="w-5 h-5 text-blue-600" /> Quality Control (Read Only)</CardTitle>
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
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
