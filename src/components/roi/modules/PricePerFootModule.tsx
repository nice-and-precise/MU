"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SliderInput } from "../components/SliderInput"
import { ComparisonCard } from "../components/ComparisonCard"
import { calculateROI, ROIInputs } from "../utils/calculations"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface PricePerFootModuleProps {
    inputs: ROIInputs
    onUpdate: (key: keyof ROIInputs, value: number) => void
    onNext: () => void
    onBack: () => void
}

export function PricePerFootModule({ inputs, onUpdate, onNext, onBack }: PricePerFootModuleProps) {
    const [step, setStep] = React.useState(0)

    const steps = [
        {
            render: () => (
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-heading">Price-Per-Foot Analytics</h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Most contractors quote by gut feel. HDD Nexus gives you actual cost data so you can bid with confidence.
                        </p>
                    </div>
                    <ComparisonCard
                        title="Bidding Logic"
                        oldWayPoints={[
                            "Bidding based on gut feeling",
                            "\"Going rate\" matching",
                            "Unknown true cost per foot",
                            "Losing money on tough ground"
                        ]}
                        newWayPoints={[
                            "Historical production rates by soil",
                            "Actual cost/ft from past jobs",
                            "Data-backed change orders",
                            "Profitability heatmaps"
                        ]}
                        savingsHighlight="Bid Smarter, Win More Profitable Work"
                    />
                </div>
            )
        },
        {
            render: () => (
                <div className="space-y-8">
                    <SliderInput
                        label="Average bore footage per project?"
                        value={inputs.avgBoreFootage ?? 0}
                        onChange={(v) => onUpdate("avgBoreFootage", v)}
                        min={0}
                        max={5000}
                        step={50}
                        suffix="ft"
                        recommendation={500}
                        recommendationLabel="Avg: 500 ft"
                    />
                    <SliderInput
                        label="Current average price per foot?"
                        value={inputs.currentPricePerFoot ?? 0}
                        onChange={(v) => onUpdate("currentPricePerFoot", v)}
                        min={0}
                        max={100}
                        step={1}
                        prefix="$"
                        recommendation={18}
                        recommendationLabel="Avg: $18"
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
    // Check if we have enough data to show insight
    const showInsight = inputs.currentPricePerFoot && inputs.currentPricePerFoot > 0

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Bidding Intelligence</CardTitle>
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
                {step === 1 && showInsight && (
                    <div className="mt-8 p-4 bg-rose-50/50 dark:bg-rose-900/10 rounded-lg border border-rose-100 dark:border-rose-900">
                        <p className="text-sm text-center text-muted-foreground mb-1">Insight</p>
                        <p className="text-xl font-bold text-center text-rose-600 dark:text-rose-400">
                            {results.pricePerFootInsight.recommendation}
                        </p>
                        <div className="flex justify-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>Est Cost: ${results.pricePerFootInsight.estimatedTrueCost.toFixed(2)}/ft</span>
                            <span>Margin: ${results.pricePerFootInsight.currentMargin.toFixed(2)}/ft</span>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={handleBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={handleNext}>
                    {step === steps.length - 1 ? "View Results" : "Continue"} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </CardFooter>
        </Card>
    )
}
