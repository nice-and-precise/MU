'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { FormControl } from '@/components/ui/form';
import { FormLayout } from '@/components/ui/FormLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UpdateDailyReportInput } from '@/schemas/daily-report';
import { Plus, Trash2, ClipboardList, BookTemplate } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { CostCodeSelect } from './CostCodeSelect';

export function StepProduction() {
    const { control } = useFormContext<UpdateDailyReportInput>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "production"
    });

    const handleApplyTemplate = (type: string) => {
        if (type === 'PILOT_REAM') {
            append({ activity: 'Pilot', lf: 0, pitch: 0, azimuth: 0 });
            append({ activity: 'Ream', lf: 0 });
            toast.success("Added Pilot & Ream rows");
        } else if (type === 'PULL') {
            append({ activity: 'Pull', lf: 0 });
            append({ activity: 'Setup', lf: 0 });
            toast.success("Added Pull & Setup rows");
        } else if (type === 'TEST_PIT') {
            append({ activity: 'Pothole', lf: 0 }); // Assuming Pothole can be tracked here or maybe it's just general activity
            toast.success("Added Pothole row");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center sm:gap-4">
                <h2 className="text-xl font-semibold">Production Logs</h2>
                <div className="flex gap-2">
                    <Select onValueChange={handleApplyTemplate}>
                        <SelectTrigger className="w-[180px]">
                            <BookTemplate className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Load Template" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PILOT_REAM">Pilot & Ream</SelectItem>
                            <SelectItem value="PULL">Pull & Setup</SelectItem>
                            <SelectItem value="TEST_PIT">Potholing</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={() => append({ activity: 'Drill', lf: 0 })} size="sm">
                        <Plus className="w-4 h-4 mr-2" /> Add Log
                    </Button>
                </div>
            </div>

            {fields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No production recorded.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {fields.map((field, index) => (
                        <Card key={field.id} className="bg-slate-50">
                            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                <div className="md:col-span-3">
                                    <FormLayout
                                        name={`production.${index}.activity`}
                                        label="Activity"
                                        children={(field) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Drill">Drill</SelectItem>
                                                    <SelectItem value="Pilot">Pilot</SelectItem>
                                                    <SelectItem value="Ream">Ream</SelectItem>
                                                    <SelectItem value="Pull">Pull</SelectItem>
                                                    <SelectItem value="Setup">Setup</SelectItem>
                                                    <SelectItem value="Pothole">Pothole</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <FormLayout
                                        name={`production.${index}.costItemId`}
                                        label="Cost Code"
                                        children={(field) => (
                                            <CostCodeSelect
                                                value={field.value}
                                                onChange={(val) => field.onChange(val)}
                                            />
                                        )}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <FormLayout
                                        name={`production.${index}.lf`}
                                        label="Footage"
                                        children={(field) => (
                                            <Input
                                                type="number"
                                                min="0"
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                            />
                                        )}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <FormLayout
                                        name={`production.${index}.pitch`}
                                        label="Pitch"
                                        children={(field) => (
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                            />
                                        )}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <FormLayout
                                        name={`production.${index}.azimuth`}
                                        label="Az"
                                        children={(field) => (
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                            />
                                        )}
                                    />
                                </div>
                                <div className="md:col-span-1 flex justify-end">
                                    <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
