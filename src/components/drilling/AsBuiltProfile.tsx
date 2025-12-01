'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Label } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { generateAsBuiltPDF } from '@/lib/pdf';

interface AsBuiltProfileProps {
    rodPasses: any[];
    boreName: string;
}

export default function AsBuiltProfile({ rodPasses, boreName }: AsBuiltProfileProps) {
    // Transform data for chart
    const data = [
        { distance: 0, depth: 0, rod: 0 }, // Entry point
        ...rodPasses.map(r => ({
            distance: Math.sqrt((r.north || 0) ** 2 + (r.east || 0) ** 2),
            depth: -(r.depth || 0), // Plot depth as negative for intuitive "underground" view
            rod: r.sequence,
            pitch: r.pitch
        }))
    ];

    const handleExport = () => {
        // Reconstruct bore object for PDF generator
        const bore = {
            name: boreName,
            rodPasses: rodPasses
        };
        generateAsBuiltPDF(bore);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>As-Built Profile</CardTitle>
                <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="w-4 h-4 mr-2" /> Export PDF
                </Button>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="distance"
                                type="number"
                                domain={['auto', 'auto']}
                                unit="'"
                                label={{ value: 'Distance (ft)', position: 'bottom', offset: 0 }}
                            />
                            <YAxis
                                unit="'"
                                label={{ value: 'Depth (ft)', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip
                                labelFormatter={(value) => `Distance: ${Number(value).toFixed(1)}'`}
                                formatter={(value: number, name: string) => [
                                    name === 'depth' ? `${Math.abs(value).toFixed(1)}'` : value,
                                    name === 'depth' ? 'Depth' : name
                                ]}
                            />
                            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3">
                                <Label value="Surface" position="insideTopLeft" />
                            </ReferenceLine>
                            <Line
                                type="monotone"
                                dataKey="depth"
                                stroke="#2563eb"
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
