'use client';

import { useFormContext } from 'react-hook-form';
import { FormLayout } from '@/components/ui/FormLayout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UpdateDailyReportInput } from '@/schemas/daily-report';

export function StepGeneral() {
    const { control } = useFormContext<UpdateDailyReportInput>();

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">General Information</h2>

            <FormLayout
                name="weather"
                label="Weather Conditions"
                children={(field) => <Input placeholder="e.g. Sunny, 75F" {...field} />}
            />

            <FormLayout
                name="notes"
                label="Daily Notes"
                children={(field) => (
                    <Textarea
                        placeholder="General site notes, delays, visitors, etc."
                        className="min-h-[150px]"
                        {...field}
                    />
                )}
            />
        </div>
    );
}
