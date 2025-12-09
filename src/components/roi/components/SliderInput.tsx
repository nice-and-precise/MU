"use client"

import * as React from "react"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface SliderInputProps {
    value: number | null
    onChange: (value: number) => void
    min?: number
    max?: number
    step?: number
    label?: string
    suffix?: string
    prefix?: string
    placeholder?: string
    className?: string
    defaultValue?: number
}

export function SliderInput({
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    label,
    suffix,
    prefix,
    placeholder,
    className,
    defaultValue = 0,
    recommendation,
    recommendationLabel = "Use Industry Average"
}: SliderInputProps & { recommendation?: number, recommendationLabel?: string }) {
    const currentValue = value ?? defaultValue

    const handleSliderChange = (vals: number[]) => {
        onChange(vals[0])
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value)
        if (!isNaN(val)) {
            onChange(val)
        }
    }

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex justify-between items-end">
                {label && <Label className="text-base font-semibold text-foreground/80">{label}</Label>}
                {recommendation !== undefined && (
                    <button
                        type="button"
                        onClick={() => onChange(recommendation)}
                        className="text-xs text-orange-600 dark:text-orange-400 hover:underline font-medium"
                    >
                        I don't know ({recommendationLabel})
                    </button>
                )}
            </div>
            <div className="flex gap-4 items-center">
                <div className="flex-1">
                    <Slider
                        value={[currentValue]}
                        min={min}
                        max={max}
                        step={step}
                        onValueChange={handleSliderChange}
                        className="cursor-pointer"
                    />
                </div>
                <div className="relative w-24 shrink-0">
                    {prefix && (
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            {prefix}
                        </span>
                    )}
                    <Input
                        type="number"
                        value={value ?? ""}
                        placeholder={placeholder}
                        onChange={handleInputChange}
                        className={cn(
                            "h-10 text-center",
                            prefix ? "pl-6" : "",
                            suffix ? "pr-8" : ""
                        )}
                    />
                    {suffix && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            {suffix}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
