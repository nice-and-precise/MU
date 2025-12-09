"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SliderInput } from "../components/SliderInput"
import { ComparisonCard } from "../components/ComparisonCard"
import { calculateROI, ROIInputs } from "../utils/calculations"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface JobCostingModuleProps {
    inputs: ROIInputs
    onUpdate: (key: keyof ROIInputs, value: number) => void
    onNext: () => void
    onBack: () => void
}

export function JobCostingModule({ inputs, onUpdate, onNext, onBack }: JobCostingModuleProps) {
    const [step, setStep] = React.useState(0)

    const steps = [
        {
            render: () => (
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-heading">Real-Time Job Costing</h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Do you know your true job costs in real-time, or do you find out after the project is done?
                        </p>
                    </div>
                    <ComparisonCard
                        title="Cost Visibility"
                        oldWayPoints={[
                            "Find out true costs days/weeks later",
                            "Can't identify unprofitable jobs until too late",
                            "Receipts lost in truck seats",
                            "Guesswork on true margin"
                        ]}
                        newWayPoints={[
                            "Real-time burn rate & labor costs",
                            "Daily profit/loss view",
                            "Digital receipts & AP integration",
                            "Historical data for better bidding"
                        ]}
                        savingsHighlight="~3% Margin Recovery"
                    />
                </div>
            )
        },
        {
            render: () => (
                <div className="space-y-8">
                    <SliderInput
                        label="Projects completed per year?"
                        value={inputs.projectsPerYear ?? 0}
                        onChange={(v) => onUpdate("projectsPerYear", v)}
                        min={0}
                        max={200}
                        step={1}
                        suffix="jobs"
                        recommendation={20}
                        recommendationLabel="Avg: 20"
                    />
                    <SliderInput
                        label="Average project value ($)?"
                        value={inputs.avgProjectValue ?? 0}
                        onChange={(v) => onUpdate("avgProjectValue", v)}
                        min={0}
                        max={100000}
                        step={1000}
                        prefix="$"
                        placeholder="10000"
                        recommendation={15000}
                        recommendationLabel="Avg: $15k"
                    />
                </div>
            )
        }
    ]

    const currentStep = steps[step]

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1)
        } else {
            onNext()
        }
    }

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1)
        } else {
            onBack()
        }
    }

    const results = calculateROI(inputs)

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Job Costing Analysis</CardTitle>
            </CardHeader>
            <CardContent className="min-h-[300px]">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {currentStep.render()}
                </motion.div>
                {step === 1 && (
                    <div className="mt-8 p-4 bg-green-50/50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900">
                        <p className="text-sm text-center text-muted-foreground mb-1">Potential Margin Recovery</p>
                        <p className="text-3xl font-bold text-center text-green-600 dark:text-green-400">
                            ${Math.round(results.jobCostingSavings).toLocaleString()}
                        </p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={handleBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={handleNext}>
                    {step === steps.length - 1 ? "Next Module" : "Continue"} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </CardFooter>
        </Card>
    )
}
