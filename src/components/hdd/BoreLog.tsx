"use client";

import React, { useState, useEffect } from "react";
import { BigButton } from "@/components/ui/BigButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createRodPass, getBoreLogs } from "@/actions/hdd";
import { FileText, Save } from "lucide-react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FluidAlert } from "./FluidAlert";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface BoreLogProps {
    boreId: string;
    userId: string;
}

export function BoreLog({ boreId, userId }: BoreLogProps) {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [alertOpen, setAlertOpen] = useState(false);

    // Form State
    const [rodLength, setRodLength] = useState(15); // Default 15ft
    const [depth, setDepth] = useState("");
    const [pitch, setPitch] = useState("");
    const [steer, setSteer] = useState("");
    const [pullback, setPullback] = useState("");
    const [fluids, setFluids] = useState("Bentonite");
    const [returns, setReturns] = useState("Full Returns");

    useEffect(() => {
        loadLogs();
    }, [boreId]);

    async function loadLogs() {
        const res = await getBoreLogs(boreId);
        if (res.success) {
            setLogs(res.data || []);
            setLoading(false);
        }
    }

    async function handleSubmit() {
        if (!depth || !pitch) {
            alert("Depth and Pitch are required!");
            return;
        }

        if (returns === "Total Loss") {
            setAlertOpen(true);
        }

        const nextSeq = logs.length + 1;
        const data = {
            boreId,
            sequence: nextSeq,
            passNumber: 1, // Default for now
            linearFeet: rodLength,
            depth: parseFloat(depth),
            pitch: parseFloat(pitch),
            steerPosition: steer ? parseFloat(steer) : undefined,
            pullbackForce: pullback ? parseFloat(pullback) : undefined,
            fluidMix: fluids,
            returnsVisual: returns,
            loggedById: userId,
        };

        const res = await createRodPass(data);
        if (res.success) {
            setLogs([...logs, res.data]);
            // Reset form (keep rod length and fluids)
            setDepth("");
            setPitch("");
            setSteer("");
            setPullback("");
        } else {
            alert("Failed to save rod pass.");
        }
    }

    function generatePDF() {
        const doc = new jsPDF();
        doc.text("As-Built Bore Log", 14, 20);

        const tableData = logs.map(log => [
            log.sequence,
            log.linearFeet,
            log.depth,
            log.pitch,
            log.steeringToolFace || "-",
            log.pullbackForce || "-",
            log.returnsVisual || "-"
        ]);

        autoTable(doc, {
            startY: 30,
            head: [["Rod #", "Length", "Depth", "Pitch", "Steer", "Pullback", "Returns"]],
            body: tableData,
        });
        doc.save("bore-log.pdf");
    }

    const chartData = {
        labels: logs.map(l => l.sequence),
        datasets: [
            {
                label: 'Depth Profile',
                data: logs.map(l => l.depth),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: true, text: 'Bore Depth Profile' },
        },
    };

    return (
        <div className="space-y-4">
            <FluidAlert open={alertOpen} onOpenChange={setAlertOpen} />
            <Card>
                <CardHeader>
                    <CardTitle>New Rod Entry</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Rod Length (ft)</Label>
                            <Input type="number" value={rodLength} onChange={(e) => setRodLength(Number(e.target.value))} className="h-14 text-lg" />
                        </div>
                        <div className="space-y-2">
                            <Label>Depth (ft)</Label>
                            <Input type="number" value={depth} onChange={(e) => setDepth(e.target.value)} className="h-14 text-lg" placeholder="0.0" />
                        </div>
                        <div className="space-y-2">
                            <Label>Pitch (%)</Label>
                            <Input type="number" value={pitch} onChange={(e) => setPitch(e.target.value)} className="h-14 text-lg" placeholder="0.0" />
                        </div>
                        <div className="space-y-2">
                            <Label>Steer (Clock)</Label>
                            <Input type="number" value={steer} onChange={(e) => setSteer(e.target.value)} className="h-14 text-lg" placeholder="12" />
                        </div>
                        <div className="space-y-2">
                            <Label>Pullback (lbs)</Label>
                            <Input type="number" value={pullback} onChange={(e) => setPullback(e.target.value)} className="h-14 text-lg" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                            <Label>Returns</Label>
                            <Select value={returns} onValueChange={setReturns}>
                                <SelectTrigger className="h-14 text-lg">
                                    <SelectValue placeholder="Select Returns" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Full Returns">Full Returns</SelectItem>
                                    <SelectItem value="Partial Loss">Partial Loss</SelectItem>
                                    <SelectItem value="Total Loss" className="text-red-500 font-bold">Total Loss</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <BigButton
                        label="LOG ROD"
                        icon={Save}
                        onClick={handleSubmit}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                    />
                </CardContent>
            </Card >

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Bore Profile</CardTitle>
                    <BigButton
                        label="PDF"
                        icon={FileText}
                        onClick={generatePDF}
                        className="w-auto min-h-[40px] py-2"
                        variant="outline"
                        fullWidth={false}
                    />
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-2">
                <h3 className="text-lg font-semibold">Recent Logs</h3>
                {logs.slice().reverse().map((log) => (
                    <div key={log.id} className="bg-card border p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <div className="font-bold">Rod #{log.sequence}</div>
                            <div className="text-sm text-muted-foreground">Depth: {log.depth}' | Pitch: {log.pitch}%</div>
                        </div>
                        <div className={`font-bold ${log.returnsVisual === "Total Loss" ? "text-red-500" : "text-green-500"}`}>
                            {log.returnsVisual}
                        </div>
                    </div>
                ))}
            </div>
        </div >
    );
}
