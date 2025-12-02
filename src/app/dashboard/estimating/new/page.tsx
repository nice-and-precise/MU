'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEstimate } from '@/actions/estimating';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function NewEstimatePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await createEstimate({ name });
            if (res.success && res.data) {
                // Success - redirect handled by router.push
                router.push(`/dashboard/estimating/${res.data.id}`);
            } else {
                alert(res.error || 'Failed to create estimate');
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            alert('An unexpected error occurred');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Estimate</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Estimate Name</Label>
                            <Input
                                placeholder="e.g., River Crossing Bid"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Create Estimate'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
