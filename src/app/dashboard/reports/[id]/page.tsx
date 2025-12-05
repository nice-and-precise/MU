import { getReport } from '@/app/actions/reports';
import DailyReportEditForm from '@/components/DailyReportEditForm';
import { notFound } from 'next/navigation';
import { getSafetyMeetings, getJSAs } from '@/actions/safety';
import { getPunchList } from '@/actions/qc';
import { getInventoryTransactions } from '@/actions/inventory';

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const reportRes = await getReport(resolvedParams.id);

    if (!reportRes.success || !reportRes.data) {
        notFound();
    }
    const report = reportRes.data;

    // Fetch related data for the project and date
    const date = new Date(report.reportDate);

    // Safety
    const safetyMeetingsRes = await getSafetyMeetings(report.projectId);
    const safetyMeetings = safetyMeetingsRes.data || [];
    const todaysMeetings = safetyMeetings.filter(m => new Date(m.date).toDateString() === date.toDateString());

    const jsasRes = await getJSAs(report.projectId);
    const jsas = jsasRes.data || [];
    const todaysJSAs = jsas.filter(j => new Date(j.date).toDateString() === date.toDateString());

    // QC
    const punchListRes = await getPunchList(report.projectId);
    const punchList = punchListRes.data || [];
    // Filter punch items created or updated today? Or just show open ones?
    // Let's show items created today for the report context
    const todaysPunchItems = punchList.filter(p => new Date(p.createdAt).toDateString() === date.toDateString());

    // Inventory
    const inventoryRes = await getInventoryTransactions({ projectId: report.projectId, date });
    const todaysInventory = inventoryRes.success ? inventoryRes.data : [];

    // Employees & Assets for Dropdowns
    const { getEmployees } = await import('@/actions/employees');
    const { getAssets } = await import('@/actions/assets');
    const employeesRes = await getEmployees();
    const assetsRes = await getAssets();

    return (
        <div className="max-w-6xl mx-auto p-6">
            <DailyReportEditForm
                report={report}
                safetyMeetings={todaysMeetings}
                jsas={todaysJSAs}
                punchItems={todaysPunchItems}
                inventoryTransactions={todaysInventory}
                employees={employeesRes.success ? employeesRes.data : []}
                assets={assetsRes.success ? assetsRes.data : []}
            />
        </div>
    );
}
