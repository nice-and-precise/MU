import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { CollisionResult } from '../../lib/drilling/math/collision';

interface CollisionWarningProps {
    collisions: CollisionResult[];
}

export default function CollisionWarning({ collisions }: CollisionWarningProps) {
    if (collisions.length === 0) return null;

    const nearest = collisions[0];
    const isCritical = nearest.isCollision || nearest.minDistance < 3; // Critical if < 3ft

    return (
        <div className={`
      absolute top-4 left-1/2 -translate-x-1/2 z-30 
      flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl backdrop-blur-md border-2
      animate-pulse
      ${isCritical
                ? 'bg-red-500/90 border-red-200 text-white'
                : 'bg-orange-500/90 border-orange-200 text-white'}
    `}>
            {isCritical ? <ShieldAlert size={24} /> : <AlertTriangle size={24} />}

            <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">
                    {isCritical ? 'CRITICAL WARNING' : 'PROXIMITY ALERT'}
                </span>
                <span className="text-lg font-black tracking-tight">
                    {nearest.minDistance.toFixed(1)} ft from {nearest.obstacleType.toUpperCase()}
                </span>
            </div>
        </div>
    );
}
