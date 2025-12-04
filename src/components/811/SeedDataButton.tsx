'use client';

import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';
import { seed811Data } from '@/actions/seed-811-data';
import { toast } from 'sonner';
import { useState } from 'react';

export default function SeedDataButton() {
    const [loading, setLoading] = useState(false);

    const handleSeed = async () => {
        if (!confirm('Add dummy 811 tickets for demo?')) return;

        setLoading(true);
        const result = await seed811Data();
        setLoading(false);

        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    };

    return (
        <Button variant="outline" onClick={handleSeed} disabled={loading} title="Seed Demo Data">
            <Database className="mr-2 h-4 w-4" />
            {loading ? 'Seeding...' : 'Demo Data'}
        </Button>
    );
}
