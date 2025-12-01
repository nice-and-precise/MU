'use client';

import { useEffect, useState } from 'react';
import { getTMTickets, getChangeOrders, createChangeOrder, approveChangeOrder } from '@/actions/change_management';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, FileText, CheckCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChangeOrderDashboardProps {
    projectId: string;
}

export default function ChangeOrderDashboard({ projectId }: ChangeOrderDashboardProps) {
    const router = useRouter();
    const [tickets, setTickets] = useState<any[]>([]);
    const [cos, setCos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadData() {
        setLoading(true);
        const [t, c] = await Promise.all([getTMTickets(projectId), getChangeOrders(projectId)]);
        setTickets(t);
        setCos(c);
        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, [projectId]);

    const handleConvertToCO = async (ticket: any) => {
        if (!confirm('Convert this ticket to a Change Order?')) return;
        const res = await createChangeOrder({
            projectId,
            tmTicketId: ticket.id,
            scope: `From T&M Ticket: ${JSON.parse(ticket.lineItems)[0]?.description || 'Extra Work'}`,
            pricing: 'T&M',
            budgetImpact: 0, // In a real app, we'd calculate this or prompt for it
        });
        if (res.success) {
            loadData();
            router.refresh();
        }
    };

    const handleApproveCO = async (id: string) => {
        if (!confirm('Approve this Change Order? This will increase the project budget.')) return;
        const res = await approveChangeOrder(id);
        if (res.success) {
            loadData();
            router.refresh();
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <Tabs defaultValue="tickets">
                <TabsList>
                    <TabsTrigger value="tickets">T&M Tickets ({tickets.length})</TabsTrigger>
                    <TabsTrigger value="cos">Change Orders ({cos.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="tickets" className="space-y-4">
                    {tickets.map(ticket => (
                        <Card key={ticket.id}>
                            <CardContent className="p-4 flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-blue-500" />
                                        <span className="font-medium">Ticket #{ticket.id.slice(-4)}</span>
                                        <Badge variant="outline">{ticket.status}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {new Date(ticket.createdAt).toLocaleDateString()} • {ticket.createdBy.name}
                                    </p>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => handleConvertToCO(ticket)}>
                                    Convert to CO <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                    {tickets.length === 0 && <p className="text-center text-muted-foreground py-8">No tickets found.</p>}
                </TabsContent>

                <TabsContent value="cos" className="space-y-4">
                    {cos.map(co => (
                        <Card key={co.id}>
                            <CardContent className="p-4 flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className={`w-4 h-4 ${co.status === 'APPROVED' ? 'text-green-500' : 'text-gray-400'}`} />
                                        <span className="font-medium">{co.scope}</span>
                                        <Badge className={co.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                            {co.status}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Impact: ${co.budgetImpact.toLocaleString()}
                                    </p>
                                </div>
                                {co.status !== 'APPROVED' && (
                                    <Button size="sm" onClick={() => handleApproveCO(co.id)}>
                                        Approve
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                    {cos.length === 0 && <p className="text-center text-muted-foreground py-8">No Change Orders found.</p>}
                </TabsContent>
            </Tabs>
        </div>
    );
}
