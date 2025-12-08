'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { FormControl } from '@/components/ui/form';
import { FormLayout } from '@/components/ui/FormLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UpdateDailyReportInput } from '@/schemas/daily-report';
import { Plus, Trash2, Truck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CostCodeSelect } from './CostCodeSelect';

interface StepEquipmentProps {
    assets: any[];
}

export function StepEquipment({ assets }: StepEquipmentProps) {
    const { control } = useFormContext<UpdateDailyReportInput>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "equipment"
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Equipment Usage</h2>
                <Button onClick={() => append({ assetId: '', hours: 0 })} size="sm">
                    <Plus className="w-4 h-4 mr-2" /> Add Equipment
                </Button>
            </div>

            {fields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <Truck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No equipment added yet.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {fields.map((field, index) => (
                        <Card key={field.id} className="bg-slate-50">
                            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                <div className="md:col-span-5">
                                    <FormLayout
                                        name={`equipment.${index}.assetId`}
                                        label="Asset"
                                        children={(field) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Asset" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {assets.map(asset => (
                                                        <SelectItem key={asset.id} value={asset.id}>
                                                            {asset.name} ({asset.type})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                <div className="md:col-span-4">
                                    <FormLayout
                                        name={`equipment.${index}.costItemId`}
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
                                        name={`equipment.${index}.hours`}
                                        label="Hours"
                                        children={(field) => (
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.5"
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
