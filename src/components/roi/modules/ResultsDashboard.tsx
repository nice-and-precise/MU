"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { calculateROI, ROIInputs } from "../utils/calculations"
import { SavingsCard } from "../components/SavingsCard"
import { Map, DollarSign, Clock, Leaf, RefreshCcw } from "lucide-react"

interface ResultsDashboardProps {
    inputs: ROIInputs
    onRestart: () => void
    onAdjust: () => void
}

export function ResultsDashboard({ inputs, onRestart, onAdjust }: ResultsDashboardProps) {
    const results = calculateROI(inputs)

    return (
        <div className="space-y-6">
            <Card className="border-t-4 border-t-green-500 shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-heading">Total Annual Impact</CardTitle>
                    <CardDescription>Based on your operational metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="text-center">
                        <span className="text-5xl md:text-6xl font-bold text-green-600 dark:text-green-400 block mb-2">
                            ${Math.round(results.totalAnnualSavings).toLocaleString()}
                        </span>
                        <span className="text-muted-foreground text-sm uppercase tracking-widest">Estimated Yearly Savings</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SavingsCard
                            title="811 Efficiency"
                            amount={results.ticket811Savings}
                            icon={Map}
                            subtitle={`${Math.round(results.ticket811HoursSaved)} hours saved`}
                        />
                        <SavingsCard
                            title="Job Costing"
                            amount={results.jobCostingSavings}
                            icon={DollarSign}
                            subtitle="Margin Recovery"
                        />
                        <SavingsCard
                            title="Payroll Admin"
                            amount={results.payrollSavings}
                            icon={Clock}
                            subtitle="Processing & Disputes"
                        />
                        <SavingsCard
                            title="Admin & Efficiency"
                            amount={results.annualSavings}
                            icon={Leaf}
                            subtitle="General Productivity"
                        />
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg text-center space-y-1">
                        <p className="font-semibold text-foreground">ROI Multiplier</p>
                        <p className="text-2xl font-bold text-orange-600">{results.roiMultiplier.toFixed(1)}x</p>
                        <p className="text-xs text-muted-foreground">Return on investment per year</p>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col md:flex-row gap-4">
                    <Button variant="outline" className="w-full" onClick={onAdjust}>
                        Adjust Numbers
                    </Button>
                    <Button variant="outline" className="w-full" onClick={onRestart}>
                        <RefreshCcw className="w-4 h-4 mr-2" /> Start Over
                    </Button>
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                        Book a Demo
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
