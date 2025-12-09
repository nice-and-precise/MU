"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calculator } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

import { ROIInputs, INITIAL_INPUTS, CalculatorMode } from "./utils/calculations"
import { ModeSelector } from "./modules/ModeSelector"
import { Ticket811Module } from "./modules/Ticket811Module"
import { JobCostingModule } from "./modules/JobCostingModule"
import { PayrollModule } from "./modules/PayrollModule"
import { PricePerFootModule } from "./modules/PricePerFootModule"
import { ResultsDashboard } from "./modules/ResultsDashboard"

// --- Main Component ---

export function ROICalculator() {
    const [mode, setMode] = React.useState<CalculatorMode | null>(null)
    const [inputs, setInputs] = React.useState<ROIInputs>(INITIAL_INPUTS)
    const [resultsVisible, setResultsVisible] = React.useState(false)

    // Helper to update inputs
    const handleUpdateInput = (key: keyof ROIInputs, value: number) => {
        setInputs((prev) => ({ ...prev, [key]: value }))
    }

    // Sequence for 'full' mode
    const [fullModeStep, setFullModeStep] = React.useState(0)
    const FULL_MODE_MODULES = ['811', 'jobcosting', 'payroll', 'priceperfoot'] as const

    const handleNext = () => {
        if (mode === 'full') {
            if (fullModeStep < FULL_MODE_MODULES.length - 1) {
                setFullModeStep(prev => prev + 1)
            } else {
                setResultsVisible(true)
            }
        } else {
            setResultsVisible(true)
        }
    }

    const handleBack = () => {
        if (resultsVisible) {
            setResultsVisible(false)
            return
        }

        if (mode === 'full') {
            if (fullModeStep > 0) {
                setFullModeStep(prev => prev - 1)
            } else {
                setMode(null)
            }
        } else {
            setMode(null)
        }
    }

    const handleModeSelect = (selectedMode: CalculatorMode) => {
        setMode(selectedMode)
        setFullModeStep(0)
        setResultsVisible(false)
    }

    const handleRestart = () => {
        setInputs(INITIAL_INPUTS)
        setMode(null)
        setFullModeStep(0)
        setResultsVisible(false)
    }

    // Render Current Module
    const renderModule = () => {
        const activeModule = mode === 'full' ? FULL_MODE_MODULES[fullModeStep] : mode

        if (resultsVisible) {
            return (
                <ResultsDashboard
                    inputs={inputs}
                    onRestart={handleRestart}
                    onAdjust={() => setResultsVisible(false)} // Go back to last module
                />
            )
        }

        switch (activeModule) {
            case '811':
                return <Ticket811Module inputs={inputs} onUpdate={handleUpdateInput} onNext={handleNext} onBack={handleBack} />
            case 'jobcosting':
                return <JobCostingModule inputs={inputs} onUpdate={handleUpdateInput} onNext={handleNext} onBack={handleBack} />
            case 'payroll':
                return <PayrollModule inputs={inputs} onUpdate={handleUpdateInput} onNext={handleNext} onBack={handleBack} />
            case 'priceperfoot':
                return <PricePerFootModule inputs={inputs} onUpdate={handleUpdateInput} onNext={handleNext} onBack={handleBack} />
            default:
                return null
        }
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            {/* Header */}
            {!resultsVisible && (
                <div className="mb-8 text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 mb-2">
                        <Calculator className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                        ROI Calculator
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        See what your true overhead is and how much HDD Nexus can save you.
                    </p>
                </div>
            )}

            <AnimatePresence mode="wait">
                <motion.div
                    key={mode ? (resultsVisible ? 'results' : `${mode}-${fullModeStep}`) : 'selector'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {!mode ? (
                        <ModeSelector onSelectMode={handleModeSelect} />
                    ) : (
                        renderModule()
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
