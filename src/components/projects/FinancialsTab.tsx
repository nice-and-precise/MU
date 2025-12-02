'use client';

import { useEffect, useState } from 'react';
import { getProjectFinancials } from '@/actions/financials';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface FinancialsTabProps {
    projectId: string;
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExpenseList from "@/components/expenses/ExpenseList";
import ExpenseForm from "@/components/expenses/ExpenseForm";

export default function FinancialsTab({ projectId }: FinancialsTabProps) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const load = async () => {
        const res = await getProjectFinancials(projectId);
        if (res.success) {
            setData(res.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, [projectId, refreshTrigger]);

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>;
    }

    if (!data) {
        return <div className="p-6 text-center text-muted-foreground">No financial data available. Ensure an Estimate is active and Daily Reports are approved.</div>;
    }

    const { estimated, actuals, profit, margin } = data;

    const chartData = [
        { name: 'Labor', Estimated: estimated.labor, Actual: actuals.labor },
        { name: 'Equipment', Estimated: estimated.equipment, Actual: actuals.equipment },
        { name: 'Materials', Estimated: estimated.materials, Actual: actuals.materials },
        { name: 'Expenses', Estimated: 0, Actual: actuals.expenses || 0 }, // Expenses usually don't have a direct estimate line unless we add it
    ];

    const formatCurrency = (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

    return (
        <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Revenue (Est)</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(estimated.revenue)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Cost (Act)</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-700">{formatCurrency(actuals.totalCost)}</div>
                            <p className="text-xs text-muted-foreground">
                                Est: {formatCurrency(estimated.totalCost)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
                            {profit >= 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(profit)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Margin</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${margin >= 20 ? 'text-green-600' : margin >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {margin.toFixed(1)}%
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Cost Variance by Category</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis tickFormatter={(val) => `$${val}`} />
                                    <Tooltip formatter={(val: number) => formatCurrency(val)} />
                                    <Legend />
                                    <Bar dataKey="Estimated" fill="#94a3b8" />
                                    <Bar dataKey="Actual" fill="#0f172a" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Detailed Table */}
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Financial Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {chartData.map((item) => {
                                    const variance = item.Estimated - item.Actual;
                                    const isPositive = variance >= 0; // Under budget is good
                                    return (
                                        <div key={item.name} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">Est: {formatCurrency(item.Estimated)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">{formatCurrency(item.Actual)}</p>
                                                <p className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                                    {isPositive ? '+' : ''}{formatCurrency(variance)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="expenses" className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Project Expenses</h2>
                    <ExpenseForm projectId={projectId} onSuccess={() => setRefreshTrigger(prev => prev + 1)} />
                </div>
                <ExpenseList projectId={projectId} refreshTrigger={refreshTrigger} />
            </TabsContent>
        </Tabs>
    );
}
