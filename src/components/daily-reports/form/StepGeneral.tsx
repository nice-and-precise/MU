'use client';

import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UpdateDailyReportInput } from '@/schemas/daily-report';

export function StepGeneral() {
    const { control } = useFormContext<UpdateDailyReportInput>();

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">General Information</h2>

            <FormField
                control={control}
                name="weather"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Weather Conditions</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. Sunny, 75F" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="notes"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Daily Notes</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="General site notes, delays, visitors, etc."
                                className="min-h-[150px]"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
