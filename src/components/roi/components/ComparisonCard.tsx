"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X } from "lucide-react"

interface ComparisonCardProps {
    title: string
    oldWayPoints: string[]
    newWayPoints: string[]
    savingsHighlight?: string
}

export function ComparisonCard({ title, oldWayPoints, newWayPoints, savingsHighlight }: ComparisonCardProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-heading text-center mb-2">{title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Old Way */}
                <Card className="border-red-100 bg-red-50/10 dark:bg-red-900/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base text-red-600 dark:text-red-400 flex items-center gap-2">
                            <X className="w-4 h-4" /> Traditional Way
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {oldWayPoints.map((point, i) => (
                            <div key={i} className="text-sm text-muted-foreground flex gap-2 items-start">
                                <span className="text-red-400 mt-1">•</span>
                                {point}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* New Way */}
                <Card className="border-green-100 bg-green-50/10 dark:bg-green-900/10 relative overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base text-green-600 dark:text-green-400 flex items-center gap-2">
                            <Check className="w-4 h-4" /> HDD Nexus Way
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {newWayPoints.map((point, i) => (
                            <div key={i} className="text-sm text-foreground flex gap-2 items-start">
                                <Check className="w-3 h-3 text-green-500 mt-1 shrink-0" />
                                {point}
                            </div>
                        ))}
                        {savingsHighlight && (
                            <div className="mt-4 pt-3 border-t border-green-200 dark:border-green-800">
                                <p className="font-bold text-green-700 dark:text-green-300 text-sm">
                                    Outcome: {savingsHighlight}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
