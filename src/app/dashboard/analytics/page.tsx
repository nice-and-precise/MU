import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductionChart } from "@/components/dashboard/ProductionChart";
import { Activity, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-primary uppercase tracking-tight">Project Performance</h1>
                    <p className="text-muted-foreground mt-1 font-sans">Real-time analytics and KPIs</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium font-heading text-muted-foreground">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-heading">$45,231.89</div>
                        <p className="text-xs text-muted-foreground font-sans">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium font-heading text-muted-foreground">Footage Drilled</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-heading">2,350 ft</div>
                        <p className="text-xs text-muted-foreground font-sans">+180 ft since yesterday</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium font-heading text-muted-foreground">Safety Incidents</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-heading text-green-600">0</div>
                        <p className="text-xs text-muted-foreground font-sans">124 Days Incident Free</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium font-heading text-muted-foreground">Efficiency</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-heading">94%</div>
                        <p className="text-xs text-muted-foreground font-sans">+4% from target</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="font-heading">Weekly Production & Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ProductionChart />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-heading">Cost Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 font-sans">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-primary" />
                                    <span className="text-sm font-medium">Labor</span>
                                </div>
                                <span className="text-sm font-bold">$12,450</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-secondary" />
                                    <span className="text-sm font-medium">Equipment</span>
                                </div>
                                <span className="text-sm font-bold">$8,320</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-accent" />
                                    <span className="text-sm font-medium">Materials</span>
                                </div>
                                <span className="text-sm font-bold">$4,150</span>
                            </div>
                            <div className="pt-4 border-t border-border mt-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold">Total Cost</span>
                                    <span className="font-bold text-lg">$24,920</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
