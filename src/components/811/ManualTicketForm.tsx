'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createTicket, TicketData, parseTicketEmail } from '@/actions/tickets';
import { getActiveProjects } from '@/actions/projects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dynamic from 'next/dynamic';
import { useForm } from "react-hook-form";
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
    FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from 'lucide-react';

// Dynamically import map to avoid SSR issues with Leaflet
const WhiteLineMap = dynamic(() => import('./WhiteLineMap'), { ssr: false, loading: () => <div className="h-[400px] bg-slate-100 animate-pulse rounded-lg" /> });

const ticketSchema = z.object({
    projectId: z.string().optional(),
    ticketNumber: z.string().min(1, "Ticket number is required"),
    type: z.string().min(1, "Type is required"),
    workToBeginDate: z.string().min(1, "Start date is required"),
    duration: z.string().optional(),
    company: z.string().min(1, "Company is required"),
    caller: z.string().min(1, "Caller is required"),
    phone: z.string().min(1, "Phone is required"),
    email: z.string().email().optional().or(z.literal("")),
    workSiteAddress: z.string().min(1, "Address is required"),
    city: z.string().optional(),
    county: z.string().optional(),
    nearestIntersection: z.string().optional(),
    gpsCoordinates: z.string().optional(),
    markingInstructions: z.string().optional(),
    explosives: z.boolean(),
    tunneling: z.boolean(),
    rightOfWay: z.boolean(),
    mapLink: z.string().url().optional().or(z.literal("")),
    electronicOnly: z.boolean().optional(),
});

type TicketValues = z.infer<typeof ticketSchema>;

export default function ManualTicketForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
    const [pasteContent, setPasteContent] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [showMap, setShowMap] = useState(false);

    const form = useForm<TicketValues>({
        resolver: zodResolver(ticketSchema) as any,
        defaultValues: {
            projectId: "",
            ticketNumber: "",
            type: "NORMAL",
            workToBeginDate: "",
            duration: "",
            company: "Midwest Underground",
            caller: "",
            phone: "",
            email: "",
            workSiteAddress: "",
            city: "",
            county: "",
            nearestIntersection: "",
            gpsCoordinates: "",
            markingInstructions: "",
            explosives: false,
            tunneling: false,
            rightOfWay: false,
            mapLink: "",
            electronicOnly: false,
        },
    });

    useEffect(() => {
        async function loadProjects() {
            const res = await getActiveProjects();
            if (res.success && res.data) {
                setProjects(res.data);
            }
        }
        loadProjects();
    }, []);

    const handleParse = async () => {
        if (!pasteContent) return;
        setIsParsing(true);
        try {
            const res = await parseTicketEmail(pasteContent);
            if (res.success && res.data) {
                const parsed = res.data;
                form.reset({
                    ...form.getValues(),
                    ticketNumber: parsed.ticketNumber || form.getValues().ticketNumber,
                    type: parsed.type || form.getValues().type,
                    workToBeginDate: parsed.workToBeginDate ? new Date(parsed.workToBeginDate).toISOString().slice(0, 16) : form.getValues().workToBeginDate,
                    company: parsed.company || form.getValues().company,
                    caller: parsed.caller || form.getValues().caller,
                    phone: parsed.phone || form.getValues().phone,
                    workSiteAddress: parsed.workSiteAddress || form.getValues().workSiteAddress,
                    county: parsed.county || form.getValues().county,
                });
                toast.success("Parsed email content successfully");
            } else {
                toast.error(res.error || "Failed to parse email content");
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to parse email content");
        } finally {
            setIsParsing(false);
        }
    };

    const handleMapPolygon = (coords: [number, number][], center: [number, number], references: string[], dimensions: string[], instructions?: string) => {
        console.log('Polygon data:', coords);

        // Generate AMI
        import('@/lib/AMIGenerator').then(mod => {
            const ami = mod.generateAMI(dimensions, references);
            form.setValue("gpsCoordinates", JSON.stringify(coords));

            // Prefer WASM instructions if available, otherwise fallback to legacy AMI
            if (instructions && instructions.length > 0) {
                form.setValue("markingInstructions", instructions);
                toast.success("Map data applied (MN 2026 Compliant)");
            } else {
                form.setValue("markingInstructions", ami);
                toast.success("Map data applied");
            }
        });
    };

    const onSubmit = async (data: TicketValues) => {
        setLoading(true);

        // Calculate expiration (14 days from work start)
        const workStart = new Date(data.workToBeginDate);
        const expiration = new Date(workStart);
        expiration.setDate(expiration.getDate() + 14);

        const ticketData: TicketData = {
            ticketNumber: data.ticketNumber,
            type: data.type,
            status: 'ACTIVE',
            submittedAt: new Date(),
            workToBeginDate: workStart,
            expirationDate: expiration,
            company: data.company,
            caller: data.caller,
            phone: data.phone,
            email: data.email || "",
            workSiteAddress: data.workSiteAddress,
            city: data.city || "",
            county: data.county || "",
            nearestIntersection: data.nearestIntersection || "",
            gpsCoordinates: data.gpsCoordinates || "",
            markingInstructions: data.markingInstructions || "",
            workDescription: "", // Not in form currently, could add
            duration: data.duration || "",
            explosives: data.explosives,
            tunneling: data.tunneling,
            rightOfWay: data.rightOfWay,
            utilitiesNotified: '[]',
            mapLink: data.mapLink || "",
            notes: "",
            projectId: data.projectId || null,
        };

        if (data.electronicOnly) {
            ticketData.markingInstructions = (ticketData.markingInstructions || "") + "\n\n[ELECTRONIC WHITE LINING ONLY - NO PHYSICAL MARKS]";
        }

        const result = await createTicket(ticketData as any);

        if (!result.success) {
            toast.error((result as any).error || 'Failed to create ticket');
            setLoading(false);
            return;
        }

        toast.success("Ticket created successfully");
        router.push('/811');
        setLoading(false);
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>New 811 Ticket (Manual Entry)</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Paste Area */}
                <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                    <FormLabel className="mb-2 block">Paste GSOC Email Content (Auto-Fill)</FormLabel>
                    <Textarea
                        placeholder="Paste the full text of the GSOC confirmation email here..."
                        className="min-h-[100px] mb-2 font-mono text-xs"
                        value={pasteContent}
                        onChange={(e) => setPasteContent(e.target.value)}
                    />
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleParse}
                        disabled={isParsing || !pasteContent}
                        className="w-full"
                    >
                        {isParsing ? 'Parsing...' : 'Auto-Fill Form'}
                    </Button>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="projectId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Project (Optional)</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Project" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {projects.map((p) => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ticketNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ticket Number *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="20251203-123456" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ticket Type *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="NORMAL">Normal Locate</SelectItem>
                                                <SelectItem value="EMERGENCY">Emergency</SelectItem>
                                                <SelectItem value="MEET">Meet Request</SelectItem>
                                                <SelectItem value="UPDATE">Update/Renewal</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="workToBeginDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Work to Begin *</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Duration</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. 3 days" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <FormLabel>Contact Info</FormLabel>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="company"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="Company Name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="caller"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="Caller Name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="Phone Number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="Email Address" type="email" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <FormLabel>Location</FormLabel>
                                <Button type="button" variant="outline" size="sm" onClick={() => setShowMap(!showMap)}>
                                    {showMap ? 'Hide Map' : 'Draw White Line (Map)'}
                                </Button>
                            </div>

                            {showMap && (
                                <div className="mb-4">
                                    <WhiteLineMap onPolygonComplete={handleMapPolygon} />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        * Drawing a polygon will auto-fill GPS coordinates and add boundary details to Marking Instructions.
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="workSiteAddress"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormControl>
                                                <Input placeholder="Street Address" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="City" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="county"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="County" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="nearestIntersection"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="Nearest Intersection" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="gpsCoordinates"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="GPS Coordinates" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="markingInstructions"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Marking Instructions</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Describe where to mark..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-6">
                            <FormField
                                control={form.control}
                                name="explosives"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Explosives</FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="tunneling"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Tunneling/Boring</FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="rightOfWay"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Right of Way</FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                            <FormField
                                control={form.control}
                                name="electronicOnly"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1">
                                            <FormLabel>Utilize Electronic White Lining Only (No Physical Marks)</FormLabel>
                                            <FormDescription>
                                                Select this for winter conditions or when painting is not possible.
                                            </FormDescription>
                                            {field.value && (
                                                <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
                                                    ⚠️ Important: If a utility operator specifically requests physical marks, you must return to the site and paint per MN 216D.05(c).
                                                </div>
                                            )}
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="mapLink"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Map Link (URL)</FormLabel>
                                    <FormControl>
                                        <Input type="url" placeholder="https://mn.itic.occinc.com/..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                                {loading ? 'Creating...' : 'Create Ticket'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card >
    );
}
