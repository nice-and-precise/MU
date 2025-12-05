'use client';

import { StationProgress } from '@prisma/client';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { addProgress } from '@/actions/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LinearProgressBarProps {
    projectId: string;
    totalLength: number;
    progressData: StationProgress[];
}

export function LinearProgressBar({ projectId, totalLength, progressData }: LinearProgressBarProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Calculate max end station to determine current progress
    const maxStation = progressData.reduce((max, p) => Math.max(max, p.endStation), 0);
    const percentage = Math.min(100, Math.max(0, (maxStation / totalLength) * 100));

    const [formData, setFormData] = useState({
        startStation: maxStation,
        endStation: maxStation + 100, // Default increment
        status: 'PILOT',
        date: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addProgress({
                projectId,
                startStation: Number(formData.startStation),
                endStation: Number(formData.endStation),
                status: formData.status,
                date: new Date(formData.date),
            });
            setOpen(false);
        } catch (error) {
            console.error('Failed to add progress', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-lg font-medium">Linear Progress</h3>
                    <p className="text-sm text-muted-foreground">
                        {maxStation.toFixed(0)} / {totalLength.toFixed(0)} ft ({percentage.toFixed(1)}%)
                    </p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">Update Progress</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Update Linear Progress</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="startStation">Start Station (ft)</Label>
                                    <Input
                                        id="startStation"
                                        type="number"
                                        value={formData.startStation}
                                        onChange={(e) => setFormData({ ...formData, startStation: Number(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="endStation">End Station (ft)</Label>
                                    <Input
                                        id="endStation"
                                        type="number"
                                        value={formData.endStation}
                                        onChange={(e) => setFormData({ ...formData, endStation: Number(e.target.value) })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Activity</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select activity" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PILOT">Pilot Hole</SelectItem>
                                        <SelectItem value="REAM">Reaming</SelectItem>
                                        <SelectItem value="PULLBACK">Pullback</SelectItem>
                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={loading}>Save</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
                <div
                    className="h-full bg-primary transition-all duration-500 ease-in-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* Visual Markers for segments could go here */}
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 ft</span>
                <span>{totalLength} ft</span>
            </div>
        </div>
    );
}
