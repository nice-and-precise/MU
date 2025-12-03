'use client';

import { Shift, Project, Crew, Employee } from '@prisma/client';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Navigation, CheckCircle } from 'lucide-react';
import { updateShift } from '@/actions/schedule';
import { useState } from 'react';
import { format } from 'date-fns';

interface ShiftCardProps {
    shift: Shift & { project: Project; crew: Crew | null; employee: Employee | null };
}

export function ShiftCard({ shift }: ShiftCardProps) {
    const [status, setStatus] = useState(shift.status);
    const [loading, setLoading] = useState(false);

    const handleStatusUpdate = async (newStatus: string) => {
        setLoading(true);
        try {
            await updateShift(shift.id, { status: newStatus });
            setStatus(newStatus);
        } catch (error) {
            console.error(error);
            alert('Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-l-4 border-l-[#003366] shadow-sm">
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">{shift.project.name}</h3>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(shift.startTime), 'h:mm a')} - {format(new Date(shift.endTime), 'h:mm a')}
                        </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                        }`}>
                        {status.replace('_', ' ')}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
                {shift.project.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{shift.project.address}</span>
                    </div>
                )}
                {shift.notes && (
                    <div className="bg-yellow-50 p-2 rounded text-xs text-yellow-800 border border-yellow-100">
                        <strong>Note:</strong> {shift.notes}
                    </div>
                )}
            </CardContent>
            <CardFooter className="p-4 pt-0 grid grid-cols-2 gap-2">
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shift.project.address || '')}`, '_blank')}
                >
                    <Navigation className="w-4 h-4 mr-2" /> Map
                </Button>

                {status === 'SCHEDULED' && (
                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleStatusUpdate('IN_PROGRESS')}
                        disabled={loading}
                    >
                        Start Work
                    </Button>
                )}
                {status === 'IN_PROGRESS' && (
                    <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleStatusUpdate('COMPLETED')}
                        disabled={loading}
                    >
                        <CheckCircle className="w-4 h-4 mr-2" /> Complete
                    </Button>
                )}
                {status === 'COMPLETED' && (
                    <Button disabled variant="secondary" className="w-full">
                        Completed
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
