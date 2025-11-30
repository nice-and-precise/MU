'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getProjectGeotech, createGeotechReport, addSoilLayer } from '@/actions/geotech';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, FileText, Layers } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function GeotechPage() {
    const params = useParams();
    const projectId = params.id as string;
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddReportOpen, setIsAddReportOpen] = useState(false);
    const [isAddLayerOpen, setIsAddLayerOpen] = useState(false);
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

    const [newReport, setNewReport] = useState({
        title: '',
        reportDate: new Date().toISOString().split('T')[0],
        engineer: '',
        description: '',
    });

    const [newLayer, setNewLayer] = useState({
        startDepth: 0,
        endDepth: 0,
        soilType: 'Clay',
        description: '',
        color: '#8B4513',
        hardness: 0,
    });

    useEffect(() => {
        loadReports();
    }, [projectId]);

    async function loadReports() {
        setLoading(true);
        const res = await getProjectGeotech(projectId);
        if (res.success) {
            setReports(res.data || []);
        }
        setLoading(false);
    }

    async function handleCreateReport() {
        const res = await createGeotechReport({ ...newReport, projectId });
        if (res.success) {
            setIsAddReportOpen(false);
            loadReports();
            setNewReport({
                title: '',
                reportDate: new Date().toISOString().split('T')[0],
                engineer: '',
                description: '',
            });
        }
    }

    async function handleAddLayer() {
        if (!selectedReportId) return;
        const res = await addSoilLayer({ ...newLayer, geotechReportId: selectedReportId });
        if (res.success) {
            setIsAddLayerOpen(false);
            loadReports();
            setNewLayer({
                startDepth: 0,
                endDepth: 0,
                soilType: 'Clay',
                description: '',
                color: '#8B4513',
                hardness: 0,
            });
        }
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Geotechnical Reports</h1>
                    <p className="text-muted-foreground">Manage soil borings and subsurface data.</p>
                </div>
                <Dialog open={isAddReportOpen} onOpenChange={setIsAddReportOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Report
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Geotech Report</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Report Title</Label>
                                <Input
                                    id="title"
                                    value={newReport.title}
                                    onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                                    placeholder="e.g. Phase 1 Borings"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={newReport.reportDate}
                                    onChange={(e) => setNewReport({ ...newReport, reportDate: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="engineer">Geotechnical Engineer</Label>
                                <Input
                                    id="engineer"
                                    value={newReport.engineer}
                                    onChange={(e) => setNewReport({ ...newReport, engineer: e.target.value })}
                                    placeholder="Firm or Engineer Name"
                                />
                            </div>
                        </div>
                        <Button onClick={handleCreateReport}>Create Report</Button>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6">
                {loading ? (
                    <p>Loading reports...</p>
                ) : reports.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <FileText className="h-12 w-12 mb-4 opacity-20" />
                            <p>No geotechnical reports found for this project.</p>
                        </CardContent>
                    </Card>
                ) : (
                    reports.map((report) => (
                        <Card key={report.id}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg">{report.title}</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(report.reportDate).toLocaleDateString()} • {report.engineer || 'Unknown Engineer'}
                                    </p>
                                </div>
                                <Dialog open={isAddLayerOpen} onOpenChange={(open) => {
                                    setIsAddLayerOpen(open);
                                    if (open) setSelectedReportId(report.id);
                                }}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <Plus className="mr-2 h-4 w-4" /> Add Layer
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add Soil Layer</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label>Start Depth (ft)</Label>
                                                    <Input
                                                        type="number"
                                                        value={newLayer.startDepth}
                                                        onChange={(e) => setNewLayer({ ...newLayer, startDepth: parseFloat(e.target.value) })}
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>End Depth (ft)</Label>
                                                    <Input
                                                        type="number"
                                                        value={newLayer.endDepth}
                                                        onChange={(e) => setNewLayer({ ...newLayer, endDepth: parseFloat(e.target.value) })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Soil Type</Label>
                                                <Select
                                                    value={newLayer.soilType}
                                                    onValueChange={(val) => setNewLayer({ ...newLayer, soilType: val })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Clay">Clay</SelectItem>
                                                        <SelectItem value="Sand">Sand</SelectItem>
                                                        <SelectItem value="Silt">Silt</SelectItem>
                                                        <SelectItem value="Gravel">Gravel</SelectItem>
                                                        <SelectItem value="Cobble">Cobble</SelectItem>
                                                        <SelectItem value="Rock">Solid Rock</SelectItem>
                                                        <SelectItem value="Fill">Fill / Debris</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Description</Label>
                                                <Input
                                                    value={newLayer.description}
                                                    onChange={(e) => setNewLayer({ ...newLayer, description: e.target.value })}
                                                    placeholder="e.g. Fat clay, high plasticity"
                                                />
                                            </div>
                                        </div>
                                        <Button onClick={handleAddLayer}>Save Layer</Button>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                                        <Layers className="h-4 w-4" />
                                        <span>Stratigraphy</span>
                                    </div>
                                    <div className="rounded-md border overflow-hidden">
                                        {report.soilLayers.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-muted-foreground bg-gray-50 dark:bg-gray-900">
                                                No soil layers defined.
                                            </div>
                                        ) : (
                                            <div className="divide-y">
                                                {report.soilLayers.map((layer: any) => (
                                                    <div key={layer.id} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                        <div
                                                            className="w-4 h-12 rounded mr-4 shrink-0"
                                                            style={{ backgroundColor: layer.color || '#888' }}
                                                            title={layer.soilType}
                                                        />
                                                        <div className="flex-1 grid grid-cols-3 gap-4">
                                                            <div>
                                                                <p className="font-medium text-sm">{layer.soilType}</p>
                                                                <p className="text-xs text-muted-foreground">{layer.description}</p>
                                                            </div>
                                                            <div className="text-sm">
                                                                {layer.startDepth}' - {layer.endDepth}'
                                                            </div>
                                                            <div className="text-right text-sm text-muted-foreground">
                                                                Thickness: {(layer.endDepth - layer.startDepth).toFixed(1)}'
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
