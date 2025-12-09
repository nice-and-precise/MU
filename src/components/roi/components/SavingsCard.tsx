"use client"

import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface SavingsCardProps {
    title: string
    amount: number
    icon: LucideIcon
    subtitle?: string
}

export function SavingsCard({ title, amount, icon: Icon, subtitle }: SavingsCardProps) {
    return (
        <Card>
            <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold font-heading text-foreground">
                        ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        <span className="text-xs font-sans font-normal text-muted-foreground ml-1">/ yr</span>
                    </p>
                    {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
                </div>
            </CardContent>
        </Card>
    )
}
