'use client';

import { useState, useMemo } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { Shift, Crew, Employee, Project } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { ShiftModal } from './ShiftModal';

interface ScheduleBoardProps {
    shifts: (Shift & { project: Project; crew: Crew | null; employee: Employee | null })[];
    crews: Crew[];
    employees: Employee[];
    projects: Project[];
}

export function ScheduleBoard({ shifts, crews, employees, projects }: ScheduleBoardProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

    const startDate = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
    const days = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDays(startDate, i)), [startDate]);

    const resources = useMemo(() => [
        ...crews.map(c => ({ id: c.id, name: c.name, type: 'CREW' })),
        ...employees.map(e => ({ id: e.id, name: `${e.firstName} ${e.lastName}`, type: 'EMPLOYEE' }))
    ], [crews, employees]);

    const getShiftsForResourceAndDay = (resourceId: string, day: Date) => {
        return shifts.filter(s => {
            const isResourceMatch = s.crewId === resourceId || s.employeeId === resourceId;
            const isDayMatch = isSameDay(new Date(s.startTime), day);
            return isResourceMatch && isDayMatch;
        });
    };

    const handlePrev = () => setCurrentDate(addDays(currentDate, -7));
    const handleNext = () => setCurrentDate(addDays(currentDate, 7));

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {format(startDate, 'MMMM yyyy')}
                    </h2>
                    <div className="flex items-center bg-white dark:bg-slate-900 rounded-md border shadow-sm dark:border-slate-800">
                        <Button variant="ghost" size="icon" onClick={handlePrev}><ChevronLeft className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date())}><CalendarIcon className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={handleNext}><ChevronRight className="w-4 h-4" /></Button>
                    </div>
                </div>
                <Button onClick={() => { setSelectedShift(null); setIsModalOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" /> New Shift
                </Button>
            </div>

            <div className="border rounded-lg bg-white dark:bg-slate-900 overflow-x-auto dark:border-slate-800">
                <table className="w-full min-w-[1000px] border-collapse">
                    <thead>
                        <tr>
                            <th className="p-4 border-b border-r w-48 bg-slate-50 text-left font-semibold text-slate-600">Resource</th>
                            {days.map(day => (
                                <th key={day.toISOString()} className={`p-4 border-b w-32 text-center ${isSameDay(day, new Date()) ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-600'}`}>
                                    <div className="font-bold">{format(day, 'EEE')}</div>
                                    <div className="text-sm font-normal">{format(day, 'd')}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {resources.map(resource => (
                            <tr key={resource.id} className="group hover:bg-slate-50">
                                <td className="p-3 border-b border-r font-medium">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${resource.type === 'CREW' ? 'bg-blue-500' : 'bg-green-500'}`} />
                                        {resource.name}
                                    </div>
                                </td>
                                {days.map(day => {
                                    const dayShifts = getShiftsForResourceAndDay(resource.id, day);
                                    return (
                                        <td key={day.toISOString()} className="p-1 border-b border-r h-24 align-top relative">
                                            {dayShifts.map(shift => (
                                                <div
                                                    key={shift.id}
                                                    onClick={() => { setSelectedShift(shift); setIsModalOpen(true); }}
                                                    className="mb-1 p-2 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity shadow-sm border border-l-4"
                                                    style={{
                                                        backgroundColor: '#eff6ff', // blue-50
                                                        borderColor: '#3b82f6', // blue-500
                                                        borderLeftColor: '#2563eb' // blue-600
                                                    }}
                                                >
                                                    <div className="font-bold truncate">{shift.project.name}</div>
                                                    <div className="text-slate-500 truncate">
                                                        {format(new Date(shift.startTime), 'HH:mm')} - {format(new Date(shift.endTime), 'HH:mm')}
                                                    </div>
                                                </div>
                                            ))}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ShiftModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                shift={selectedShift}
                crews={crews}
                employees={employees}
                projects={projects}
            />
        </div>
    );
}
