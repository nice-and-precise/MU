'use client';

import dynamic from 'next/dynamic';

const ManualTicketForm = dynamic(() => import('@/components/811/ManualTicketForm'), {
    ssr: false,
    loading: () => <div className="p-8 text-center">Loading form...</div>
});

export default function NewTicketPage() {
    return (
        <div className="container mx-auto p-6">
            <ManualTicketForm />
        </div>
    );
}
