"use client";

import React from 'react';

interface HighContrastToggleProps {
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
}

export default function HighContrastToggle({ enabled, onToggle }: HighContrastToggleProps) {
    return (
        <div className="flex items-center gap-3">
            <span className={`text-sm font-bold ${enabled ? 'text-black' : 'text-slate-400'}`}>
                {enabled ? 'DAY MODE' : 'Night Mode'}
            </span>
            <button
                onClick={() => onToggle(!enabled)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-yellow-500 ${enabled ? 'bg-yellow-500' : 'bg-slate-700'
                    }`}
            >
                <span className="sr-only">Toggle High Contrast</span>
                <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-7' : 'translate-x-1'
                        }`}
                />
            </button>
        </div>
    );
}
