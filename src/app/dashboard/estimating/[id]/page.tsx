import { getEstimate } from '@/actions/estimating';
import EstimateEditor from '@/components/estimating/EstimateEditor';
import { notFound } from 'next/navigation';

export default async function EstimateDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const estimate = await getEstimate(resolvedParams.id);

    if (!estimate) {
        notFound();
    }

    return (
        <div className="p-6">
            <EstimateEditor estimate={estimate} />
        </div>
    );
}
