'use client';

import { Button } from '@/components/ui/button';
import { Database, RefreshCw } from 'lucide-react';
import { seedFullDemoData } from '@/actions/seed-demo-data';
import { toast } from 'sonner';
import { useState } from 'react';

export function DemoSeedButton() {
    const [loading, setLoading] = useState(false);

    const handleSeed = async () => {
        if (!confirm('WARNING: This will populate the database with demo data. Continue?')) return;

        setLoading(true);
        const result = await seedFullDemoData();
        setLoading(false);

        if (result.success) {
            toast.success(result.message);
            // Optional: Reload page to show new data
            window.location.reload();
        } else {
            toast.error(result.message);
        }
    };

    return (
        <Button variant="destructive" size="sm" onClick={handleSeed} disabled={loading} title="Populate System with Demo Data">
            {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
            {loading ? 'Seeding...' : 'Seed Demo System'}
        </Button>
    );
}
