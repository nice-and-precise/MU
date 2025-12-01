import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

async function getEstimates() {
    return await prisma.estimate.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
            project: { select: { name: true } },
            createdBy: { select: { name: true } },
        },
    });
}

export default async function EstimatingPage() {
    const estimates = await getEstimates();

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Estimating</h1>
                <Link href="/dashboard/estimating/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" /> New Estimate
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {estimates.map((estimate) => (
                    <Link key={estimate.id} href={`/dashboard/estimating/${estimate.id}`}>
                        <Card className="hover:bg-slate-50 transition-colors cursor-pointer">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg font-semibold truncate">
                                        {estimate.name}
                                    </CardTitle>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${estimate.status === 'WON' ? 'bg-green-100 text-green-800' :
                                            estimate.status === 'LOST' ? 'bg-red-100 text-red-800' :
                                                estimate.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                        }`}>
                                        {estimate.status}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                        <FileText className="w-4 h-4 mr-2" />
                                        {estimate.customerName || estimate.project?.name || 'No Customer'}
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        {new Date(estimate.updatedAt).toLocaleDateString()}
                                    </div>
                                    <div className="pt-2 border-t mt-2 flex justify-between items-center font-medium text-foreground">
                                        <span>Total:</span>
                                        <span>${estimate.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}

                {estimates.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No estimates found. Create one to get started.
                    </div>
                )}
            </div>
        </div>
    );
}
