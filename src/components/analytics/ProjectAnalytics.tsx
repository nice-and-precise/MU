'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { formatCurrency } from '@/lib/utils';
import { useTheme } from 'next-themes';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

interface Financials {
    estimated: {
        revenue: number;
        totalCost: number;
        labor: number;
        equipment: number;
        materials: number;
        subcontract: number;
        other: number;
    };
    actuals: {
        totalCost: number;
        labor: number;
        equipment: number;
        materials: number;
        subcontract: number;
        expenses: number;
    };
    profit: number;
    margin: number;
}

interface Props {
    data: Financials;
}

export default function ProjectAnalytics({ data }: Props) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const textColor = isDark ? '#e5e7eb' : '#1f2937';
    const gridColor = isDark ? '#374151' : '#e5e7eb';

    const barData = {
        labels: ['Revenue', 'Total Cost', 'Profit'],
        datasets: [
            {
                label: 'Project Financials',
                data: [data.estimated.revenue, data.actuals.totalCost, data.profit],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.7)', // Green (Revenue)
                    'rgba(239, 68, 68, 0.7)', // Red (Cost)
                    'rgba(59, 130, 246, 0.7)', // Blue (Profit)
                ],
                borderColor: [
                    'rgb(34, 197, 94)',
                    'rgb(239, 68, 68)',
                    'rgb(59, 130, 246)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const costBreakdownData = {
        labels: ['Labor', 'Equipment', 'Materials', 'Subcontract', 'Other'],
        datasets: [
            {
                label: 'Actual Costs',
                data: [
                    data.actuals.labor,
                    data.actuals.equipment,
                    data.actuals.materials,
                    data.actuals.subcontract,
                    data.actuals.expenses
                ],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1,
            },
            {
                label: 'Budget',
                data: [
                    data.estimated.labor,
                    data.estimated.equipment,
                    data.estimated.materials,
                    data.estimated.subcontract,
                    data.estimated.other
                ],
                backgroundColor: 'rgba(200, 200, 200, 0.2)',
                borderColor: 'rgba(200, 200, 200, 1)',
                borderWidth: 1,
                hidden: true // Hide budget by default to reduce clutter
            }
        ],
    };

    const options: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: textColor }
            },
            title: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                grid: { color: gridColor },
                ticks: {
                    color: textColor,
                    callback: function (value: any) {
                        return '$' + value / 1000 + 'k';
                    }
                }
            },
            x: {
                grid: { display: false },
                ticks: { color: textColor }
            }
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Profitability & Margin</CardTitle>
                    <CardDescription>
                        Net Margin: <span className={data.margin >= 0 ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                            {data.margin.toFixed(1)}%
                        </span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <Bar data={barData} options={options} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Cost Breakdown</CardTitle>
                    <CardDescription>Actual Spend by Category</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <Bar data={costBreakdownData} options={options} />
                </CardContent>
            </Card>
        </div>
    );
}
