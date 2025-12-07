'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { FormControl } from '@/components/ui/form';
import { FormLayout } from '@/components/ui/FormLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UpdateDailyReportInput } from '@/schemas/daily-report';
import { Plus, Trash2, Users, History, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getRecentProjectReport } from '@/actions/reports';
import { useState } from 'react';
import { toast } from 'sonner';

interface StepCrewProps {
    employees: any[];
    projectId: string;
}

export function StepCrew({ employees, projectId }: StepCrewProps) {
    const { control, setValue } = useFormContext<UpdateDailyReportInput>();
    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: "crew"
    });
    const [loadingRecent, setLoadingRecent] = useState(false);

    const handleCopyRecent = async () => {
        setLoadingRecent(true);
        try {
            const res = await getRecentProjectReport(projectId);
            if (res.success && res.data) {
                // Check relational data first
                if (res.data.laborEntries && res.data.laborEntries.length > 0) {
                    const cleanCrew = res.data.laborEntries.map((l: any) => ({
                        employeeId: l.employeeId,
                        hours: l.hours || 0,
                        role: l.costCode || 'Labor'
                    }));
                    replace(cleanCrew);
                    toast.success("Copied crew from last approved report");
                }
                // Fallback to legacy JSON
                else if (res.data.crew) {
                    const previousCrew = typeof res.data.crew === 'string' ? JSON.parse(res.data.crew) : res.data.crew;
                    if (Array.isArray(previousCrew) && previousCrew.length > 0) {
                        const cleanCrew = previousCrew.map((c: any) => ({
                            employeeId: c.employeeId,
                            hours: c.hours || 0,
                            role: c.role || 'Labor'
                        }));
                        replace(cleanCrew);
                        toast.success("Copied crew from last approved report");
                    } else {
                        toast.info("Previous report had no crew data");
                    }
                } else {
                    toast.info("Previous report had no crew data");
                }
            } else {
                toast.warning("No previous approved report found for this project");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load recent report");
        } finally {
            setLoadingRecent(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
                <h2 className="text-xl font-semibold">Crew Labor</h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopyRecent} disabled={loadingRecent}>
                        {loadingRecent ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <History className="w-4 h-4 mr-2" />}
                        Use Yesterday's Crew
                    </Button>
                    <Button onClick={() => append({ employeeId: '', hours: 0, role: 'Labor' })} size="sm">
                        <Plus className="w-4 h-4 mr-2" /> Add Member
                    </Button>
                </div>
            </div>

            {fields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No crew members added.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {fields.map((field, index) => (
                        <Card key={field.id} className="bg-slate-50">
                            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                <div className="md:col-span-5">
                                    <FormLayout
                                        name={`crew.${index}.employeeId`}
                                        label="Employee"
                                        children={(field) => (
                                            <Select
                                                onValueChange={(val) => {
                                                    field.onChange(val);
                                                    // Auto-set role
                                                    const emp = employees.find(e => e.id === val);
                                                    if (emp) {
                                                        setValue(`crew.${index}.role`, emp.role || 'Labor');
                                                    }
                                                }}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Employee" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {employees.map(emp => (
                                                        <SelectItem key={emp.id} value={emp.id}>
                                                            {emp.firstName} {emp.lastName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <FormLayout
                                        name={`crew.${index}.role`}
                                        label="Role"
                                        children={(field) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Role" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Foreman">Foreman</SelectItem>
                                                    <SelectItem value="Operator">Operator</SelectItem>
                                                    <SelectItem value="Labor">Labor</SelectItem>
                                                    <SelectItem value="Driver">Driver</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <FormLayout
                                        name={`crew.${index}.hours`}
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
