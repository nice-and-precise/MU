"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalculatorMode } from "../utils/calculations"
import { Map, DollarSign, Clock, Activity } from "lucide-react"



interface ModeSelectorProps {
    onSelectMode: (mode: CalculatorMode) => void
}

export function ModeSelector({ onSelectMode }: ModeSelectorProps) {
    const modes = [
        {
            id: "full" as CalculatorMode,
            title: "Full ROI Analysis",
            description: "Complete walkthrough of all potential savings.",
            icon: Activity, // Placeholder
            color: "bg-orange-500",
        },
        {
            id: "811" as CalculatorMode,
            title: "811 Ticket Efficiency",
            description: "Focus on locate request management.",
            icon: Map,
            color: "bg-blue-500",
        },
        {
            id: "jobcosting" as CalculatorMode,
            title: "Job Costing & Visibility",
            description: "Real-time cost tracking benefits.",
            icon: DollarSign,
            color: "bg-green-500",
        },
        {
            id: "payroll" as CalculatorMode,
            title: "Payroll & Time",
            description: "GPS-verified timekeeping savings.",
            icon: Clock,
            color: "bg-purple-500",
        },
        {
            id: "priceperfoot" as CalculatorMode,
            title: "Price-Per-Foot",
            description: "Analyze your true drilling costs.",
            icon: Activity,
            color: "bg-rose-500",
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modes.map((mode) => (
                <Card
                    key={mode.id}
                    className={`cursor-pointer hover:border-orange-500 transition-all ${mode.id === 'full' ? 'md:col-span-2 border-orange-200 dark:border-orange-900 bg-orange-50/10' : ''}`}
                    onClick={() => onSelectMode(mode.id)}
                >
                    <CardContent className="p-6 flex items-start gap-4">
                        <div className={`p-3 rounded-lg text-white shrink-0 ${mode.color}`}>
                            <mode.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-heading text-lg font-bold">{mode.title}</h3>
                            <p className="text-muted-foreground text-sm mt-1">{mode.description}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
