
import { FinancialsService } from "@/services/financials";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Activity, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { seedFullDemoData } from "@/actions/seed-demo-data"; // Use the server action for safety

export default async function FinancialsPage() {
    const stats = await FinancialsService.getOwnerStats();

    // Fetch detailed project list for the table
    const projects = await prisma.project.findMany({
        where: { status: { in: ['IN_PROGRESS', 'COMPLETED', 'PLANNING'] } },
        orderBy: { updatedAt: 'desc' },
        include: {
            estimates: {
                where: { status: 'APPROVED' },
                take: 1
            }
        }
    });

    // Enhance projects with financial data (parallel fetch)
    const projectFinancials = await Promise.all(
        projects.map(async (p) => {
            try {
                const fin = await FinancialsService.getProjectFinancials(p.id);
                return { ...p, financials: fin };
            } catch (e) {
                return { ...p, financials: null };
            }
        })
    );

    const hasData = stats.totalRevenue > 0 || projects.length > 0;

    if (!hasData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="bg-blue-50 dark:bg-slate-800 p-6 rounded-full mb-6">
                    <DollarSign className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Financial Overview Unavailable</h2>
                <p className="text-gray-600 dark:text-slate-400 max-w-md mb-8">
                    No financial data found. Seed the demo environment to view the financial simulation.
                </p>
                <form action={seedFullDemoData}>
                    <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                        Seed Demo Data
                    </Button>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Financial Intelligence</h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Real-time profitability and cost tracking across the organization.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-t-4 border-blue-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        <p className="text-xs text-gray-500 mt-1">Estimated based on active budgets</p>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-indigo-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase">Total Cost</CardTitle>
                        <Activity className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        <p className="text-xs text-gray-500 mt-1">Actual labor, equipment & materials</p>
                    </CardContent>
                </Card>

                <Card className={`border-t-4 shadow-sm ${stats.grossMargin >= 20 ? 'border-green-500' : 'border-yellow-500'}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase">Net Margin</CardTitle>
                        {stats.grossMargin >= 20 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-yellow-500" />
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats.grossMargin >= 20 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {stats.grossMargin.toFixed(1)}%
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Target: 25%+</p>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-orange-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase">Open Change Orders</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.openChangeOrders}</div>
                        <p className="text-xs text-gray-500 mt-1">Pending approval</p>
                    </CardContent>
                </Card>
            </div>

            {/* Project Financials Table */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Project Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Project</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Budget</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actual Cost</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Margin</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {projectFinancials.map((p) => {
                                    const fin = p.financials;
                                    const margin = fin?.margin || 0;
                                    const revenue = fin?.estimated.revenue || 0;
                                    const cost = fin?.actuals.totalCost || 0;

                                    return (
                                        <tr key={p.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle font-medium">
                                                <div className="flex flex-col">
                                                    <span>{p.name}</span>
                                                    <span className="text-xs text-gray-500">{p.location || 'No Location'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                                                    ${p.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                        p.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                            'bg-gray-100 text-gray-800'}`}>
                                                    {p.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle text-right font-mono">
                                                {revenue > 0 ? `$${revenue.toLocaleString()}` : '-'}
                                            </td>
                                            <td className="p-4 align-middle text-right font-mono">
                                                ${cost.toLocaleString()}
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                {revenue > 0 ? (
                                                    <span className={`font-bold ${margin >= 20 ? 'text-green-600' : margin >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                        {margin.toFixed(1)}%
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/dashboard/projects/${p.id}/financials`}>Details</Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
