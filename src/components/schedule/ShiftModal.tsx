'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createShift, updateShift, deleteShift } from '@/actions/schedule';
import { Shift, Crew, Employee, Project } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';

interface ShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    shift: Shift | null;
    crews: Crew[];
    employees: Employee[];
    projects: Project[];
}

export function ShiftModal({ isOpen, onClose, shift, crews, employees, projects }: ShiftModalProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        projectId: '',
        resourceType: 'CREW', // CREW or EMPLOYEE
        resourceId: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '07:00',
        endTime: '17:00',
        notes: ''
    });

    useEffect(() => {
        if (shift) {
            const start = new Date(shift.startTime);
            const end = new Date(shift.endTime);
            setFormData({
                projectId: shift.projectId,
                resourceType: shift.crewId ? 'CREW' : 'EMPLOYEE',
                resourceId: shift.crewId || shift.employeeId || '',
                date: start.toISOString().split('T')[0],
                startTime: start.toTimeString().slice(0, 5),
                endTime: end.toTimeString().slice(0, 5),
                notes: shift.notes || ''
            });
        } else {
            // Reset form
            setFormData({
                projectId: '',
                resourceType: 'CREW',
                resourceId: '',
                date: new Date().toISOString().split('T')[0],
                startTime: '07:00',
                endTime: '17:00',
                notes: ''
            });
        }
    }, [shift, isOpen]);

    const handleSubmit = async () => {
        setIsLoading(true);
        const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
        const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

        try {
            if (shift) {
                await updateShift(shift.id, {
                    startTime: startDateTime,
                    endTime: endDateTime,
                    notes: formData.notes
                });
            } else {
                await createShift({
                    projectId: formData.projectId,
                    crewId: formData.resourceType === 'CREW' ? formData.resourceId : undefined,
                    employeeId: formData.resourceType === 'EMPLOYEE' ? formData.resourceId : undefined,
                    startTime: startDateTime,
                    endTime: endDateTime,
                    notes: formData.notes
                });
            }
            router.refresh();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to save shift');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!shift || !confirm('Are you sure you want to delete this shift?')) return;
        setIsLoading(true);
        try {
            await deleteShift(shift.id);
            router.refresh();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to delete shift');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{shift ? 'Edit Shift' : 'New Shift'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Project</Label>
                        <Select
                            value={formData.projectId}
                            onValueChange={(val) => setFormData({ ...formData, projectId: val })}
                            disabled={!!shift} // Disable changing project on edit for simplicity
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Project" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Resource Type</Label>
                            <Select
                                value={formData.resourceType}
                                onValueChange={(val) => setFormData({ ...formData, resourceType: val, resourceId: '' })}
                                disabled={!!shift}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CREW">Crew</SelectItem>
                                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Resource</Label>
                            <Select
                                value={formData.resourceId}
                                onValueChange={(val) => setFormData({ ...formData, resourceId: val })}
                                disabled={!!shift}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {formData.resourceType === 'CREW' ? (
                                        crews.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)
                                    ) : (
                                        employees.map(e => <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>)
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Date</Label>
                        <Input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Start Time</Label>
                            <Input
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>End Time</Label>
                            <Input
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Notes</Label>
                        <Input
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>
                </div>
                <DialogFooter className="flex justify-between sm:justify-between">
                    {shift && (
                        <Button variant="destructive" size="icon" onClick={handleDelete} disabled={isLoading}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={() => handleSubmit(false)} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
