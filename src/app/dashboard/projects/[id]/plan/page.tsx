import React from 'react';
import RodPlanningGrid from '@/components/planning/RodPlanningGrid';

export default function PlanningPage({ params }: { params: { id: string } }) {
    return (
        <div className="h-full w-full p-4">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-slate-100">Bore Planning: Project {params.id}</h1>
                <p className="text-slate-400">Plan your bore path rod-by-rod.</p>
            </div>
            <RodPlanningGrid />
        </div>
    );
}
