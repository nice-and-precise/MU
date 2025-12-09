"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { SliderInput } from "../components/SliderInput"
import { ComparisonCard } from "../components/ComparisonCard"
import { calculateROI, ROIInputs } from "../utils/calculations"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface Ticket811ModuleProps {
    inputs: ROIInputs
    onUpdate: (key: keyof ROIInputs, value: number) => void
    onNext: () => void
    onBack: () => void
}

export function Ticket811Module({ inputs, onUpdate, onNext, onBack }: Ticket811ModuleProps) {
    const [step, setStep] = React.useState(0)

    const steps = [
        // Intro Step
        {
            render: () => (
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-heading">811 Ticket Management</h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            811 locate tickets are critical but time-consuming. Let's see how much time you're spending on ticket management.
                        </p>
                    </div>
                    <ComparisonCard
                        title="Ticket Management Logic"
                        oldWayPoints={[
                            "Manual phone calls or web entry",
                            "Paper expirations on a whiteboard",
                            "Risk of working on expired tickets",
                            "No link to project files"
                        ]}
                        newWayPoints={[
                            "Auto-parse emails into the system",
                            "Map view of all active tickets",
                            "Automated expiration alerts (3-day warn)",
                            "Linked directly to jobs"
                        ]}
                        savingsHighlight="90% reduction in admin time"
                    />
                </div>
            )
        },
        // Questions Step
        {
            render: () => (
                <div className="space-y-8">
                    <SliderInput
                        label="How many locate tickets do you file per month?"
                        value={inputs.ticketsPerMonth ?? 0}
                        onChange={(v) => onUpdate("ticketsPerMonth", v)}
                        min={0}
                        max={500}
                        step={5}
                        suffix="tickets"
                        recommendation={50}
                        recommendationLabel="Avg: 50"
                    />
                    <SliderInput
                        label="Minutes spent per ticket (old way)? (Calls, logging, tracking)"
                        value={inputs.avgTicketTimeOld ?? 30}
                        onChange={(v) => onUpdate("avgTicketTimeOld", v)}
                        min={5}
                        max={60}
                        step={5}
                        suffix="mins"
                        recommendation={30}
                        recommendationLabel="Avg: 30 mins"
                    />
                    <SliderInput
                        label="Est. cost of a missed ticket? (Fines, delays, strikes)"
                        value={inputs.missedTicketCostAvg ?? 500}
                        onChange={(v) => onUpdate("missedTicketCostAvg", v)}
                        min={0}
                        max={5000}
                        step={100}
                        prefix="$"
                        placeholder="500"
                        recommendation={500}
                        recommendationLabel="Avg: $500"
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

    // Calculate live preview savings
    const results = calculateROI(inputs)

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>811 Efficiency Analysis</CardTitle>
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
                    <div className="mt-8 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900">
                        <p className="text-sm text-center text-muted-foreground mb-1">Potential Annual Savings</p>
                        <p className="text-3xl font-bold text-center text-blue-600 dark:text-blue-400">
                            ${Math.round(results.ticket811Savings).toLocaleString()}
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
