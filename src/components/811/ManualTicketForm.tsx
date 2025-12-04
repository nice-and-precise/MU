'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createTicket, TicketData, parseTicketEmail } from '@/actions/tickets';
import { getActiveProjects } from '@/actions/projects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dynamic from 'next/dynamic';

// Dynamically import map to avoid SSR issues with Leaflet
const WhiteLineMap = dynamic(() => import('./WhiteLineMap'), { ssr: false, loading: () => <div className="h-[400px] bg-slate-100 animate-pulse rounded-lg" /> });

export default function ManualTicketForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
    const [pasteContent, setPasteContent] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [showMap, setShowMap] = useState(false);

    // Form State for Auto-fill
    const [formState, setFormState] = useState({
        ticketNumber: '',
        type: 'NORMAL',
        workToBeginDate: '',
        company: 'Midwest Underground',
        caller: '',
        phone: '',
        email: '',
        workSiteAddress: '',
        city: '',
        county: '',
        utilitiesNotified: '[]',
        markingInstructions: '',
        mapLink: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleMapPolygon = (coords: [number, number][], center: [number, number], references: string[], dimensions: string[]) => {
        console.log('Polygon data:', coords);

        // Generate AMI
        import('@/lib/AMIGenerator').then(mod => {
            const ami = mod.generateAMI(dimensions, references);
            setFormState(prev => ({
                ...prev,
                gpsCoordinates: JSON.stringify(coords),
                markingInstructions: ami,
            }));
        });
    };

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
            const parsed = await parseTicketEmail(pasteContent);
            if (parsed) {
                setFormState(prev => ({
                    ...prev,
                    ticketNumber: parsed.ticketNumber,
                    type: parsed.type,
                    workToBeginDate: parsed.workToBeginDate ? new Date(parsed.workToBeginDate).toISOString().slice(0, 16) : '',
                    company: parsed.company || prev.company,
                    caller: parsed.caller || prev.caller,
                    phone: parsed.phone || prev.phone,
                    workSiteAddress: parsed.workSiteAddress || prev.workSiteAddress,
                    county: parsed.county || prev.county,
                    utilitiesNotified: parsed.utilitiesNotified || '[]',
                }));
            }
        } catch (e) {
            console.error(e);
            setError('Failed to parse email content');
        } finally {
            setIsParsing(false);
        }
    };
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);

        // Calculate expiration (14 days from work start)
        const workStart = new Date(formData.get('workToBeginDate') as string);
        const expiration = new Date(workStart);
        expiration.setDate(expiration.getDate() + 14);

        const data: TicketData = {
            ticketNumber: formData.get('ticketNumber') as string,
            type: formData.get('type') as string,
            status: 'ACTIVE',
            submittedAt: new Date(), // Assuming submitted now if manual
            workToBeginDate: workStart,
            expirationDate: expiration,
            company: formData.get('company') as string,
            caller: formData.get('caller') as string,
            phone: formData.get('phone') as string,
            email: formData.get('email') as string,
            workSiteAddress: formData.get('workSiteAddress') as string,
            city: formData.get('city') as string,
            county: formData.get('county') as string,
            nearestIntersection: formData.get('nearestIntersection') as string,
            gpsCoordinates: formData.get('gpsCoordinates') as string,
            markingInstructions: formData.get('markingInstructions') as string,
            workDescription: formData.get('workDescription') as string,
            duration: formData.get('duration') as string,
            explosives: formData.get('explosives') === 'on',
            tunneling: formData.get('tunneling') === 'on',
            rightOfWay: formData.get('rightOfWay') === 'on',
            utilitiesNotified: '[]', // Can add a utility selector later
            mapLink: formData.get('mapLink') as string,
            notes: formData.get('notes') as string,
            projectId: (formData.get('projectId') as string) || null,
        };

        const result = await createTicket(data);

        if (result.success) {
            router.push('/811');
        } else {
            setError(result.error || 'Failed to create ticket');
        }
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
                    <Label className="mb-2 block">Paste GSOC Email Content (Auto-Fill)</Label>
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

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="text-red-500 text-sm">{error}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="projectId">Project (Optional)</Label>
                            <Select name="projectId">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ticketNumber">Ticket Number *</Label>
                            <Input
                                id="ticketNumber"
                                name="ticketNumber"
                                required
                                placeholder="20251203-123456"
                                value={formState.ticketNumber}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Ticket Type *</Label>
                            <Select name="type" value={formState.type} onValueChange={(val) => setFormState(prev => ({ ...prev, type: val }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NORMAL">Normal Locate</SelectItem>
                                    <SelectItem value="EMERGENCY">Emergency</SelectItem>
                                    <SelectItem value="MEET">Meet Request</SelectItem>
                                    <SelectItem value="UPDATE">Update/Renewal</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="workToBeginDate">Work to Begin *</Label>
                            <Input
                                id="workToBeginDate"
                                name="workToBeginDate"
                                type="datetime-local"
                                required
                                value={formState.workToBeginDate}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration</Label>
                            <Input id="duration" name="duration" placeholder="e.g. 3 days" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Contact Info</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input name="company" placeholder="Company Name" value={formState.company} onChange={handleInputChange} required />
                            <Input name="caller" placeholder="Caller Name" value={formState.caller} onChange={handleInputChange} required />
                            <Input name="phone" placeholder="Phone Number" value={formState.phone} onChange={handleInputChange} required />
                            <Input name="email" placeholder="Email Address" type="email" value={formState.email} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>Location</Label>
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
                            <Input name="workSiteAddress" placeholder="Street Address" required className="md:col-span-2" value={formState.workSiteAddress} onChange={handleInputChange} />
                            <Input name="city" placeholder="City" value={formState.city} onChange={handleInputChange} />
                            <Input name="county" placeholder="County" value={formState.county} onChange={handleInputChange} />
                            <Input name="nearestIntersection" placeholder="Nearest Intersection" />
                            <Input name="gpsCoordinates" placeholder="GPS Coordinates" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="markingInstructions">Marking Instructions</Label>
                        <Textarea
                            id="markingInstructions"
                            name="markingInstructions"
                            placeholder="Describe where to mark..."
                            value={formState.markingInstructions}
                            onChange={(e) => setFormState(prev => ({ ...prev, markingInstructions: e.target.value }))}
                        />
                    </div>

                    <div className="flex gap-6">
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" id="explosives" name="explosives" className="h-4 w-4" />
                            <Label htmlFor="explosives">Explosives</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" id="tunneling" name="tunneling" className="h-4 w-4" />
                            <Label htmlFor="tunneling">Tunneling/Boring</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" id="rightOfWay" name="rightOfWay" className="h-4 w-4" />
                            <Label htmlFor="rightOfWay">Right of Way</Label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="mapLink">Map Link (URL)</Label>
                        <Input
                            id="mapLink"
                            name="mapLink"
                            type="url"
                            placeholder="https://mn.itic.occinc.com/..."
                            value={formState.mapLink}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Ticket'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
