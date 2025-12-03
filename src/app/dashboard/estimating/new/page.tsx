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
        console.log("Submitting estimate creation for:", name);
        setLoading(true);
        try {
            const res = await createEstimate({ name });
            console.log("Estimate creation result:", res);
            if (res.success && res.data) {
                // Success - redirect handled by router.push
                console.log("Redirecting to:", `/dashboard/estimating/${res.data.id}`);
                try {
                    router.push(`/dashboard/estimating/${res.data.id}`);
                } catch (navError) {
                    console.error("Navigation error:", navError);
                    alert("Estimate created, but failed to redirect. Please check the list.");
                    setLoading(false);
                }
            } else {
                console.error("Estimate creation failed:", res.error);
                alert(res.error || 'Failed to create estimate');
                setLoading(false);
            }
        } catch (error) {
            console.error("Unexpected error creating estimate:", error);
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
