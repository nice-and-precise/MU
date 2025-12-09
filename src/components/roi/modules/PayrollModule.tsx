"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SliderInput } from "../components/SliderInput"
import { ComparisonCard } from "../components/ComparisonCard"
import { calculateROI, ROIInputs } from "../utils/calculations"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface PayrollModuleProps {
    inputs: ROIInputs
    onUpdate: (key: keyof ROIInputs, value: number) => void
    onNext: () => void
    onBack: () => void
}

export function PayrollModule({ inputs, onUpdate, onNext, onBack }: PayrollModuleProps) {
    const [step, setStep] = React.useState(0)

    const steps = [
        {
            render: () => (
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-heading">Payroll & Time Tracking</h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Manual timesheets are slow and error-prone. Quantify the savings from GPS-verified time tracking.
                        </p>
                    </div>
                    <ComparisonCard
                        title="Time Logic"
                        oldWayPoints={[
                            "Paper timesheets or text messages",
                            "\"Rounding up\" hours (Time Theft)",
                            "Hours spent correcting mistakes",
                            "Disputes on pay day"
                        ]}
                        newWayPoints={[
                            "GPS Geofenced Clock-in/out",
                            "Automatic overtime calculation",
                            "Export directly to payroll system",
                            "Verified location data"
                        ]}
                        savingsHighlight="70% Faster Payroll Processing"
                    />
                </div>
            )
        },
        {
            render: () => (
                <div className="space-y-8">
                    <SliderInput
                        label="Hours spent on payroll processing per week?"
                        value={inputs.weeklyPayrollHours ?? 0}
                        onChange={(v) => onUpdate("weeklyPayrollHours", v)}
                        min={0}
                        max={40}
                        step={0.5}
                        suffix="hrs"
                        recommendation={5}
                        recommendationLabel="Avg: 5 hrs"
                    />
                    <SliderInput
                        label="Number of time disputes per month?"
                        value={inputs.timeDisputes ?? 0}
                        onChange={(v) => onUpdate("timeDisputes", v)}
                        min={0}
                        max={20}
                        step={1}
                        suffix="disputes"
                        recommendation={3}
                        recommendationLabel="Avg: 3"
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
                <CardTitle>Payroll Savings</CardTitle>
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
                    <div className="mt-8 p-4 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900">
                        <p className="text-sm text-center text-muted-foreground mb-1">Potential Admin Savings</p>
                        <p className="text-3xl font-bold text-center text-purple-600 dark:text-purple-400">
                            ${Math.round(results.payrollSavings).toLocaleString()}
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
