import { getTickets } from '@/actions/tickets';
import TicketList from '@/components/811/TicketList';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function TicketDashboard() {
    const { data: tickets, error } = await getTickets();

    if (error) {
        return <div className="p-8 text-red-500">Error loading tickets: {error}</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">811 Ticket Management</h1>
                    <p className="text-muted-foreground">Track and manage GSOC locate requests</p>
                </div>
                <Link href="/811/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Ticket
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="text-sm font-medium text-muted-foreground">Active Tickets</div>
                    <div className="text-2xl font-bold">{tickets?.filter(t => t.status === 'ACTIVE').length || 0}</div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="text-sm font-medium text-muted-foreground">Expiring Soon</div>
                    <div className="text-2xl font-bold text-orange-500">
                        {tickets?.filter(t => {
                            if (t.status !== 'ACTIVE') return false;
                            const days = Math.ceil((new Date(t.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            return days <= 3 && days >= 0;
                        }).length || 0}
                    </div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="text-sm font-medium text-muted-foreground">Expired</div>
                    <div className="text-2xl font-bold text-red-500">
                        {tickets?.filter(t => {
                            if (t.status !== 'ACTIVE') return false;
                            return new Date(t.expirationDate) < new Date();
                        }).length || 0}
                    </div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="text-sm font-medium text-muted-foreground">Total Tickets</div>
                    <div className="text-2xl font-bold">{tickets?.length || 0}</div>
                </div>
            </div>

            <TicketList tickets={tickets || []} />
        </div>
    );
}
