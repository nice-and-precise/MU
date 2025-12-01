import { getReport } from '@/app/actions/reports';
import DailyReportEditForm from '@/components/DailyReportEditForm';
import { notFound } from 'next/navigation';

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const report = await getReport(resolvedParams.id);

    if (!report) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <DailyReportEditForm report={report} />
        </div>
    );
}
