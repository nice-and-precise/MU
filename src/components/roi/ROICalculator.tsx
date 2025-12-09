"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, RefreshCcw, Leaf, Calculator } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// --- Types & Constants ---

type ROIInputs = {
    teamSize: number | null
    basePay: number | null
    loadPercent: number | null
    adminHoursPerWeek: number | null
    annualRevenue: number | null
    efficiencyPercent: number | null
}

const INITIAL_INPUTS: ROIInputs = {
    teamSize: null,
    basePay: null,
    loadPercent: null,
    adminHoursPerWeek: null,
    annualRevenue: null,
    efficiencyPercent: null,
}

// --- Steps Data ---

const STEPS = [
    { id: "intro", title: "ROI Calculator" },
    { id: "q1", title: "Team Size" },
    { id: "q2", title: "Hourly Pay" },
    { id: "q3", title: "Labor Burden" },
    { id: "q4", title: "Wasted Time" },
    { id: "q5", title: "Annual Revenue" },
    { id: "q6", title: "Potential Efficiency" },
    { id: "results", title: "Your Results" },
] as const

// --- Main Component ---

export function ROICalculator() {
    const [stepIndex, setStepIndex] = React.useState(0)
    const [inputs, setInputs] = React.useState<ROIInputs>(INITIAL_INPUTS)
    const [direction, setDirection] = React.useState(1)

    const currentStep = STEPS[stepIndex]

    const nextStep = () => {
        setDirection(1)
        setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1))
    }

    const prevStep = () => {
        setDirection(-1)
        setStepIndex((prev) => Math.max(prev - 1, 0))
    }

    const updateInput = (key: keyof ROIInputs, value: number) => {
        setInputs((prev) => ({ ...prev, [key]: value }))
    }

    // --- Calculations ---

    const calculateResults = () => {
        const W = inputs.basePay || 25 // Default fallback
        const L = inputs.loadPercent ? inputs.loadPercent / 100 : 0.25
        const B = 0.05 // Bonus factor

        const fullyLoadedHourly = W * (1 + L + B)

        const H_week = inputs.adminHoursPerWeek || 5 // Default fallback
        const annualWastedHours = H_week * 52
        const annualCostOfWaste = annualWastedHours * fullyLoadedHourly

        const E = inputs.efficiencyPercent ? inputs.efficiencyPercent / 100 : 0.25
        const annualHoursSaved = annualWastedHours * E
        const annualSavings = annualHoursSaved * fullyLoadedHourly

        const R = inputs.annualRevenue || 1_000_000 // Default fallback
        const M = 0.01 // 1% margin improvement
        const extraProfit = R * M

        const totalImpact = annualSavings + extraProfit

        return {
            fullyLoadedHourly,
            annualCostOfWaste,
            E_percent: E * 100,
            annualSavings,
            M_percent: M * 100,
            extraProfit,
            totalImpact,
        }
    }

    const results = calculateResults()

    // --- Animation Variants ---

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0,
        }),
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="mb-6 flex justify-between items-center text-muted-foreground text-sm">
                <span>Step {stepIndex + 1} of {STEPS.length}</span>
                <Button variant="ghost" size="sm" onClick={() => {
                    setInputs(INITIAL_INPUTS)
                    setStepIndex(0)
                }}>
                    <RefreshCcw className="w-3 h-3 mr-2" />
                    Restart
                </Button>
            </div>

            <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    key={currentStep.id}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="w-full"
                >
                    {/* --- STEP 1: INTRO --- */}
                    {currentStep.id === "intro" && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-10 w-10 bg-orange-600 rounded-lg text-white flex items-center justify-center">
                                        <Calculator className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="text-2xl">ROI Calculator</CardTitle>
                                </div>
                                <CardDescription className="text-base">
                                    See what your true labor costs are and how much HDD Nexus can save you.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p>
                                    I'll ask you 6 quick questions and then show what your current processes cost you now vs what HDD Nexus can save you each year.
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" size="lg" onClick={nextStep}>
                                    Let's Start <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {/* --- STEP 2: TEAM SIZE --- */}
                    {currentStep.id === "q1" && (
                        <QuestionCard
                            title="Who are we tracking?"
                            question="How many people is this mainly for? (e.g., field crew, production)"
                            value={inputs.teamSize}
                            onChange={(v) => updateInput("teamSize", v)}
                            onNext={nextStep}
                            onPrev={prevStep}
                            placeholder="Number of employees"
                            type="number"
                            format="raw"
                        />
                    )}

                    {/* --- STEP 3: HOURLY PAY --- */}
                    {currentStep.id === "q2" && (
                        <QuestionCard
                            title="Base Pay"
                            question="What is the average base hourly pay for those people? (e.g. $25/hr)"
                            value={inputs.basePay}
                            onChange={(v) => updateInput("basePay", v)}
                            onNext={nextStep}
                            onPrev={prevStep}
                            placeholder="25.00"
                            type="number"
                            format="currency"
                        />
                    )}

                    {/* --- STEP 4: LABOR BURDEN --- */}
                    {currentStep.id === "q3" && (
                        <QuestionCard
                            title="Labor Burden"
                            question="Roughly what percent should we add for taxes, insurance, and benefits? (Default 25%)"
                            value={inputs.loadPercent}
                            onChange={(v) => updateInput("loadPercent", v)}
                            onNext={nextStep}
                            onPrev={prevStep}
                            placeholder="25"
                            type="number"
                            format="percent"
                            recommendation={25}
                        />
                    )}

                    {/* --- STEP 5: WASTED TIME --- */}
                    {currentStep.id === "q4" && (
                        <QuestionCard
                            title="Admin Time"
                            question="Total hours per week wasted on payroll, scheduling, and job costing fixes?"
                            value={inputs.adminHoursPerWeek}
                            onChange={(v) => updateInput("adminHoursPerWeek", v)}
                            onNext={nextStep}
                            onPrev={prevStep}
                            placeholder="e.g. 5 or 10 hours"
                            type="number"
                            format="raw"
                        />
                    )}

                    {/* --- STEP 6: REVENUE --- */}
                    {currentStep.id === "q5" && (
                        <QuestionCard
                            title="Annual Revenue"
                            question="About how much revenue did you do last year?"
                            value={inputs.annualRevenue}
                            onChange={(v) => updateInput("annualRevenue", v)}
                            onNext={nextStep}
                            onPrev={prevStep}
                            placeholder="2,400,000"
                            type="number"
                            format="currency"
                        />
                    )}

                    {/* --- STEP 7: EFFICIENCY --- */}
                    {currentStep.id === "q6" && (
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl">Efficiency Potential</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <Label className="text-lg leading-relaxed block">
                                        What feels realistic for how much HDD Nexus could cut that wasted time?
                                    </Label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[25, 50, 75].map((pct) => (
                                            <Button
                                                key={pct}
                                                variant={inputs.efficiencyPercent === pct ? "default" : "outline"}
                                                onClick={() => updateInput("efficiencyPercent", pct)}
                                                className={`h-16 text-lg`}
                                            >
                                                {pct}%
                                            </Button>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button variant="ghost" onClick={prevStep}>Back</Button>
                                    <Button onClick={nextStep} disabled={!inputs.efficiencyPercent}>
                                        See Results <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    )}

                    {/* --- STEP 8: RESULTS --- */}
                    {currentStep.id === "results" && (
                        <Card className="overflow-hidden">
                            <div className="h-2 bg-gradient-to-r from-orange-500 to-amber-500 w-full" />
                            <CardHeader>
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <Leaf className="text-green-500 w-6 h-6" /> Your Potential Savings
                                </CardTitle>
                                <CardDescription>Based on the numbers you provided.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">

                                {/* Detailed Breakdown */}
                                <div className="space-y-4">
                                    <ResultRow
                                        label="Real Hourly Cost"
                                        value={`$${results.fullyLoadedHourly.toFixed(2)} / hr`}
                                        subtext={`Includes base pay + ${(inputs.loadPercent || 25)}% burden + 5% bonus factor`}
                                    />
                                    <ResultRow
                                        label="Annual Cost of Waste"
                                        value={`$${Math.round(results.annualCostOfWaste).toLocaleString()}`}
                                        subtext="Money currently lost to inefficient admin processes"
                                        highlight
                                        isNegative
                                    />
                                    <ResultRow
                                        label={`Labor Savings (${results.E_percent}%)`}
                                        value={`+$${Math.round(results.annualSavings).toLocaleString()}`}
                                        subtext="Recovered lost time"
                                        isPositive
                                    />
                                    <ResultRow
                                        label={`Profit Uplift (${results.M_percent}%)`}
                                        value={`+$${Math.round(results.extraProfit).toLocaleString()}`}
                                        subtext="From smarter bidding & job selection"
                                        isPositive
                                    />
                                </div>

                                <div className="p-6 bg-muted/50 rounded-lg border text-center space-y-2 mt-6">
                                    <p className="text-muted-foreground text-sm uppercase tracking-wider font-semibold">Total Potential Impact</p>
                                    <p className="text-4xl md:text-5xl font-bold text-green-600 dark:text-green-400">
                                        ${Math.round(results.totalImpact).toLocaleString()} <span className="text-lg text-muted-foreground font-normal">/ year</span>
                                    </p>
                                </div>

                                <div className="bg-muted p-4 rounded text-sm text-foreground leading-relaxed italic border-l-4 border-orange-500">
                                    "Based on your numbers, your <strong>${inputs.basePay}</strong>/hr employee really costs about <strong>${results.fullyLoadedHourly.toFixed(2)}</strong>/hr.
                                    The time your team spends on admin is costing roughly <strong>${Math.round(results.annualCostOfWaste).toLocaleString()}</strong> per year.
                                    With HDD Nexus, you could see a total value of about <strong>${Math.round(results.totalImpact).toLocaleString()}</strong> per year."
                                </div>

                            </CardContent>
                            <CardFooter className="flex flex-col md:flex-row gap-3">
                                <Button variant="outline" className="w-full" onClick={prevStep}>
                                    Adjust Assumptions
                                </Button>
                                <Button className="w-full">
                                    Book a Demo
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                </motion.div>
            </AnimatePresence>
        </div>
    )
}

// --- Sub-Components ---

function QuestionCard({
    title,
    question,
    value,
    onChange,
    onNext,
    onPrev,
    placeholder,
    type = "text",
    format = "raw",
    recommendation
}: {
    title: string
    question: string
    value: number | null
    onChange: (val: number) => void
    onNext: () => void
    onPrev: () => void
    placeholder?: string
    type?: string
    format?: "raw" | "currency" | "percent"
    recommendation?: number
}) {

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && value) {
            onNext()
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <Label className="text-lg leading-relaxed block">
                    {question}
                </Label>
                <div className="relative">
                    {format === "currency" && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">$</span>
                    )}
                    <Input
                        autoFocus
                        type={type}
                        placeholder={placeholder}
                        value={value ?? ""}
                        onChange={(e) => onChange(parseFloat(e.target.value))}
                        onKeyDown={handleKeyDown}
                        className={`h-14 text-lg ${format === "currency" ? "pl-8" : ""}`}
                    />
                    {format === "percent" && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">%</span>
                    )}
                </div>
                {recommendation !== undefined && !value && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-orange-500 hover:text-orange-600 -ml-2 h-auto py-1 px-2"
                        onClick={() => {
                            onChange(recommendation)
                        }}
                    >
                        Use default ({recommendation}%)
                    </Button>
                )}
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={onPrev}>Back</Button>
                <Button onClick={onNext} disabled={!value && !recommendation}>
                    Next <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </CardFooter>
        </Card>
    )
}

function ResultRow({
    label,
    value,
    subtext,
    highlight = false,
    isNegative = false,
    isPositive = false
}: {
    label: string,
    value: string,
    subtext?: string,
    highlight?: boolean,
    isNegative?: boolean
    isPositive?: boolean
}) {
    return (
        <div className={`p-3 rounded flex justify-between items-center ${highlight ? 'bg-muted' : ''}`}>
            <div>
                <p className="font-medium">{label}</p>
                {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
            </div>
            <p className={`text-lg font-bold ${isNegative ? 'text-red-500' : isPositive ? 'text-green-500' : ''}`}>
                {value}
            </p>
        </div>
    )
}
