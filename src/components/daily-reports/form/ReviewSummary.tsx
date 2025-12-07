'use client';

import { UpdateDailyReportInput } from '@/schemas/daily-report';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ReviewSummaryProps {
    report: any; // Original report object for context if needed
    formValues: UpdateDailyReportInput;
}

export function ReviewSummary({ formValues }: ReviewSummaryProps) {
    const crew = formValues.crew || [];
    const equipment = formValues.equipment || [];
    const production = formValues.production || [];
    const materials = formValues.materials || [];

    const totalManHours = crew.reduce((acc, curr) => acc + (curr.hours || 0), 0);
    const totalEquipmentHours = equipment.reduce((acc, curr) => acc + (curr.hours || 0), 0);
    const totalFootage = production.reduce((acc, curr) => acc + (curr.lf || 0), 0);

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">Review Report</h2>
                <p className="text-muted-foreground">Please verify all totals before approving.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Man Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalManHours} hrs</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Equipment Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalEquipmentHours} hrs</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Production Footage</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalFootage} ft</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-semibold block mb-1">Weather:</span>
                            {formValues.weather || "Not recorded"}
                        </div>
                        <div>
                            <span className="font-semibold block mb-1">Crew Count:</span>
                            {crew.length} members
                        </div>
                    </div>

                    <hr className="my-4 border-slate-200" />

                    <div>
                        <span className="font-semibold block mb-2">Production Breakdown:</span>
                        {production.length === 0 ? <span className="text-muted-foreground text-sm">No production</span> : (
                            <ul className="list-disc list-inside text-sm">
                                {production.map((p, i) => (
                                    <li key={i}>{p.activity}: {p.lf} ft</li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <hr className="my-4 border-slate-200" />

                    <div>
                        <span className="font-semibold block mb-2">Notes:</span>
                        <p className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-md min-h-[60px]">
                            {formValues.notes || "No additional notes."}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
