import { prisma } from '@/lib/prisma';
import TicketDetail from '@/components/811/TicketDetail';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function TicketDetailPage({ params }: PageProps) {
    const { id } = await params;

    const ticket = await prisma.ticket811.findUnique({
        where: { id },
        include: {
            responses: true,
        },
    });

    if (!ticket) {
        notFound();
    }

    return (
        <div className="container mx-auto p-6">
            <TicketDetail ticket={ticket} />
        </div>
    );
}
