"use client";

import { useState, useEffect } from "react";
import { addRodPass, getLastRodPass } from "@/actions/drilling";
import { Loader2, ArrowRight, History, WifiOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { OfflineQueue } from "@/lib/offline-queue";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const rodPassSchema = z.object({
    boreId: z.string().min(1, "Bore is required"),
    sequence: z.coerce.number().min(1, "Sequence must be positive"),
    linearFeet: z.coerce.number().min(1, "Length must be positive"),
    pitch: z.coerce.number().optional(),
    azimuth: z.coerce.number().optional(),
    depth: z.coerce.number().optional(),
    viscosity: z.coerce.number().optional(),
    mudWeight: z.coerce.number().optional(),
    steeringToolFace: z.coerce.number().optional(),
    reamerDiameter: z.coerce.number().optional(),
    notes: z.string().optional(),
});

type RodPassValues = z.infer<typeof rodPassSchema>;

export default function RodPassForm({ bores }: { bores: any[] }) {
    const [loading, setLoading] = useState(false);
    const [lastPass, setLastPass] = useState<any>(null);

    const form = useForm<RodPassValues>({
        resolver: zodResolver(rodPassSchema) as any,
        defaultValues: {
            boreId: "",
            sequence: 1,
            linearFeet: 10,
            notes: "",
        },
    });

    const selectedBoreId = form.watch("boreId");

    useEffect(() => {
        if (selectedBoreId) {
            fetchLastPass(selectedBoreId);
        } else {
            setLastPass(null);
            form.setValue("sequence", 1);
        }
    }, [selectedBoreId]);

    async function fetchLastPass(boreId: string) {
        const result = await getLastRodPass(boreId);
        const pass = result?.data;
        setLastPass(pass);
        if (pass) {
            form.setValue("sequence", pass.sequence + 1);
        } else {
            form.setValue("sequence", 1);
        }
    }

    const onSubmit = async (data: RodPassValues) => {
        setLoading(true);
        try {
            if (!navigator.onLine) {
                // Offline Mode
                OfflineQueue.add('ROD_PASS', {
                    boreId: data.boreId,
                    length: data.linearFeet,
                    pitch: data.pitch || 0,
                    azimuth: data.azimuth || 0,
                    viscosity: data.viscosity,
                    mudWeight: data.mudWeight,
                    reamerDiameter: data.reamerDiameter,
                    steeringToolFace: data.steeringToolFace,
                    notes: data.notes
                });
                toast.success("Offline: Rod Pass saved to queue!");

                // Reset non-sticky fields manually since we don't have server response
                form.reset({
                    boreId: data.boreId,
                    sequence: data.sequence + 1,
                    linearFeet: 10,
                    notes: "",
                    // Keep telemetry empty for new reading
                    pitch: undefined,
                    azimuth: undefined,
                    depth: undefined,
                    viscosity: undefined,
                    mudWeight: undefined,
                    steeringToolFace: undefined,
                    reamerDiameter: undefined,
                });
                // Optimistic UI update for last pass could go here, but keeping it simple for now
                setLoading(false);
                return;
            }

            const res = await addRodPass({
                boreId: data.boreId,
                length: data.linearFeet,
                pitch: data.pitch || 0,
                azimuth: data.azimuth || 0,
                viscosity: data.viscosity,
                mudWeight: data.mudWeight,
                reamerDiameter: data.reamerDiameter,
                steeringToolFace: data.steeringToolFace,
                notes: data.notes
            });

            if (res?.data) {
                toast.success("Rod pass logged successfully!");

                // Reset non-sticky fields
                form.reset({
                    boreId: data.boreId,
                    sequence: (res.data.sequence || data.sequence) + 1,
                    linearFeet: 10,
                    notes: "",
                    // Keep telemetry empty for new reading
                    pitch: undefined,
                    azimuth: undefined,
                    depth: undefined,
                    viscosity: undefined,
                    mudWeight: undefined,
                    steeringToolFace: undefined,
                    reamerDiameter: undefined,
                });

                setLastPass(res.data);
            } else {
                toast.error(res?.error || "Failed to log rod pass");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">

                        <FormField
                            control={form.control}
                            name="boreId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Select Bore</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="-- Choose Active Bore --" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {bores.map((b) => (
                                                <SelectItem key={b.id} value={b.id}>
                                                    {b.name} ({b.project?.name || 'Unknown Project'})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="sequence"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Rod Sequence #</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} className="font-mono" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="linearFeet"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Length (LF)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                Telemetry Data
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="pitch"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs text-gray-500">Pitch (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="0.0" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="azimuth"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs text-gray-500">Azimuth (°)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="0.0" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="depth"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs text-gray-500">Depth (ft)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="0.0" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                Detailed Reporting
                            </h3>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <FormField
                                    control={form.control}
                                    name="viscosity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs text-gray-500">Viscosity (sec)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="45" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="mudWeight"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs text-gray-500">Mud Wt (lb/gal)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="8.4" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="steeringToolFace"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs text-gray-500">Tool Face (°)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="0-360" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="reamerDiameter"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs text-gray-500">Reamer (in)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="Optional" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea rows={3} placeholder="Soil conditions, steering adjustments..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            disabled={loading || !selectedBoreId}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                                <>
                                    Log Rod Pass <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>
                </Form>
            </div>

            {/* Context Sidebar */}
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                        <History className="h-5 w-5 mr-2 text-gray-400" />
                        Previous Rod
                    </h3>

                    {lastPass ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-sm text-gray-500">Sequence</span>
                                <span className="font-mono font-bold text-gray-900 dark:text-white">#{lastPass.sequence}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Pitch</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{lastPass.pitch ?? '-'}%</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Azimuth</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{lastPass.azimuth ?? '-'}°</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Depth</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{typeof lastPass.depth === 'number' ? lastPass.depth.toFixed(1) : (lastPass.depth ?? '-')} ft</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Length</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{lastPass.linearFeet} ft</p>
                                </div>
                                {lastPass.viscosity && (
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Visc / Mud</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{lastPass.viscosity}s / {lastPass.mudWeight}lb</p>
                                    </div>
                                )}
                                {lastPass.steeringToolFace !== null && (
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Tool Face</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{lastPass.steeringToolFace}°</p>
                                    </div>
                                )}
                            </div>
                            {lastPass.notes && (
                                <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{lastPass.notes}"</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p className="text-sm">No previous passes found.</p>
                            <p className="text-xs mt-1">Select a bore to see history.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
