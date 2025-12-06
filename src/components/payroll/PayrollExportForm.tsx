'use client';

import { useState, useTransition } from 'react';
import { getPayrollReport } from '@/actions/payroll';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PayrollExportFormProps {
    onReportGenerated: (data: any[]) => void;
}

export function PayrollExportForm({ onReportGenerated }: PayrollExportFormProps) {
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(),
        to: new Date(),
    });
    const [isPending, startTransition] = useTransition();

    const handleGenerate = () => {
        if (!date?.from || !date?.to) {
            toast.error("Please select a date range");
            return;
        }

        startTransition(async () => {
            const result = await getPayrollReport({ dateRange: { from: date.from!, to: date.to! } });
            if (result.success && result.data) {
                onReportGenerated(result.data);
                toast.success("Report generated successfully");
            } else {
                toast.error(result.error || "Failed to generate report");
            }
        });
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-end bg-white p-4 rounded-lg border shadow-sm">
            <div className="grid gap-2">
                <label className="text-sm font-medium">Pay Period</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-full sm:w-[300px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date?.from ? (
                                date.to ? (
                                    <>
                                        {format(date.from, "LLL dd, y")} -{" "}
                                        {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Pick a date</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <Button onClick={handleGenerate} disabled={isPending}>
                {isPending ? "Generating..." : "Generate Report"}
            </Button>
        </div>
    );
}
