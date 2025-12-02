import { getReport } from '@/app/actions/reports';
import DailyReportEditForm from '@/components/DailyReportEditForm';
import { notFound } from 'next/navigation';
import { getSafetyMeetings, getJSAs } from '@/actions/safety';
import { getPunchList } from '@/actions/qc';
import { getInventoryTransactions } from '@/actions/inventory';

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const report = await getReport(resolvedParams.id);

    if (!report) {
        notFound();
    }

    // Fetch related data for the project and date
    const date = new Date(report.reportDate);

    // Safety
    const safetyMeetings = await getSafetyMeetings(report.projectId);
    const todaysMeetings = safetyMeetings.filter(m => new Date(m.date).toDateString() === date.toDateString());

    const jsas = await getJSAs(report.projectId);
    const todaysJSAs = jsas.filter(j => new Date(j.date).toDateString() === date.toDateString());

    // QC
    const punchList = await getPunchList(report.projectId);
    // Filter punch items created or updated today? Or just show open ones?
    // Let's show items created today for the report context
    const todaysPunchItems = punchList.filter(p => new Date(p.createdAt).toDateString() === date.toDateString());

    // Inventory
    const inventoryRes = await getInventoryTransactions(report.projectId, date);
    const todaysInventory = inventoryRes.success ? inventoryRes.data : [];

    return (
        <div className="max-w-6xl mx-auto p-6">
            <DailyReportEditForm
                report={report}
                safetyMeetings={todaysMeetings}
                jsas={todaysJSAs}
                punchItems={todaysPunchItems}
                inventoryTransactions={todaysInventory}
            />
        </div>
    );
}
