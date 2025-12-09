"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Pie, PieChart, Legend } from "recharts";

interface FinancialChartsProps {
    totalRevenue: number;
    totalCost: number;
    laborCost: number;
    materialCost: number;
    equipmentCost: number;
    overheadCost: number;
}

export function FinancialCharts({
    totalRevenue,
    totalCost,
    laborCost,
    materialCost,
    equipmentCost,
    overheadCost
}: FinancialChartsProps) {

    // --- 1. Revenue Mock Data (Trend) ---
    // Generate a smooth 6-month curve ending at current revenue
    const revenueData = [
        { name: 'Jul', revenue: totalRevenue * 0.55 },
        { name: 'Aug', revenue: totalRevenue * 0.62 },
        { name: 'Sep', revenue: totalRevenue * 0.78 },
        { name: 'Oct', revenue: totalRevenue * 0.85 },
        { name: 'Nov', revenue: totalRevenue * 0.92 },
        { name: 'Dec', revenue: totalRevenue },
    ];

    // --- 2. Cost Breakdown Data ---
    const costData = [
        { name: 'Labor', value: laborCost, color: '#3b82f6' }, // Blue
        { name: 'Materials', value: materialCost, color: '#10b981' }, // Green
        { name: 'Equipment', value: equipmentCost, color: '#f59e0b' }, // Amber
        { name: 'Overhead', value: overheadCost, color: '#6366f1' }, // Indigo
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Revenue Trend (6 Months)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#888888" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false} 
                                />
                                <YAxis 
                                    stroke="#888888" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} 
                                />
                                <Tooltip 
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#3b82f6" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorRevenue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Cost Breakdown Chart */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Cost Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full flex items-center justify-center">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={costData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {costData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                     formatter={(value: number) => [`$${value.toLocaleString()}`, 'Cost']}
                                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={36} 
                                    iconType="circle"
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
