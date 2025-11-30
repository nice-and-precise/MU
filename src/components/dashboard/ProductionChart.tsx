"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
    { name: 'Mon', footage: 400, revenue: 2400 },
    { name: 'Tue', footage: 300, revenue: 1398 },
    { name: 'Wed', footage: 200, revenue: 9800 },
    { name: 'Thu', footage: 278, revenue: 3908 },
    { name: 'Fri', footage: 189, revenue: 4800 },
    { name: 'Sat', footage: 239, revenue: 3800 },
    { name: 'Sun', footage: 349, revenue: 4300 },
];

export function ProductionChart() {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                        dataKey="name"
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="footage" name="Footage Drilled (ft)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="revenue" name="Revenue ($)" fill="#003366" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
