'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Project } from '@prisma/client';
import { Loader2, Play, Square } from 'lucide-react';
import { clockIn, clockOut } from '@/actions/time';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface TimeEntryControlsProps {
    employeeId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activeEntry: any | null;
    projects: Project[];
    weeklyEstimatedGrossPay?: number;
}

export function TimeEntryControls({ employeeId, activeEntry, projects, weeklyEstimatedGrossPay }: TimeEntryControlsProps) {
    const router = useRouter();
    const [selectedProject, setSelectedProject] = useState<string>(activeEntry?.projectId || "");
    const [isPending, startTransition] = useTransition();

    // Get location helper
    const getLocation = (): Promise<{ lat: number; long: number }> => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve({ lat: 0, long: 0 });
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ lat: pos.coords.latitude, long: pos.coords.longitude }),
                () => resolve({ lat: 0, long: 0 }) // Fail silently to 0,0
            );
        });
    };

    const handleClockIn = async () => {
        const loc = await getLocation();

        startTransition(async () => {
            const res = await clockIn({
                employeeId,
                projectId: selectedProject || undefined,
                lat: loc.lat,
                long: loc.long,
                type: 'WORK'
            });

            if (res.success) {
                toast.success("Clocked In");
                router.refresh(); // Refresh server state without reload
            } else {
                toast.error(res.error || "Failed to clock in");
            }
        });
    };

    const handleClockOut = async () => {
        const loc = await getLocation();

        startTransition(async () => {
            const res = await clockOut({
                employeeId,
                lat: loc.lat,
                long: loc.long
            });

            if (res.success) {
                toast.success("Clocked Out");
                router.refresh();
            } else {
                toast.error(res.error || "Failed to clock out");
            }
        });
    };

    if (activeEntry) {
        return (
            <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Currently Working On</p>
                        <h3 className="font-bold text-lg text-emerald-700">
                            {projects.find(p => p.id === activeEntry.projectId)?.name || "General"}
                        </h3>
                        <p className="text-xs text-gray-400">Started at {new Date(activeEntry.startTime).toLocaleTimeString()}</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="animate-pulse h-3 w-3 rounded-full bg-emerald-500 mb-1"></div>
                        {typeof weeklyEstimatedGrossPay !== 'undefined' && (
                            <p className="text-xs text-emerald-600 font-medium whitespace-nowrap">
                                Est. Pay: ${weeklyEstimatedGrossPay.toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>

                <Button
                    variant="destructive"
                    className="w-full flex items-center justify-center gap-2 h-12 text-lg"
                    onClick={handleClockOut}
                    disabled={isPending}
                >
                    {isPending ? <Loader2 className="animate-spin" /> : <Square className="fill-current w-4 h-4" />}
                    Clock Out
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Select Project</label>
                <Select value={selectedProject} onValueChange={setSelectedProject} disabled={isPending}>
                    <SelectTrigger>
                        <SelectValue placeholder="General / No Project" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="general">General / No Project</SelectItem>
                        {projects.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Button
                className="w-full flex items-center justify-center gap-2 h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleClockIn}
                disabled={isPending}
            >
                {isPending ? <Loader2 className="animate-spin" /> : <Play className="fill-current w-4 h-4" />}
                Clock In
            </Button>
        </div>
    );
}
