'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, X } from 'lucide-react';

export function DailyReportTour() {
    const [isOpen, setIsOpen] = useState(false);

    if (!isOpen) {
        return (
            <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.preventDefault(); setIsOpen(true); }}
                className="gap-2 text-slate-500"
            >
                <HelpCircle className="w-4 h-4" />
                Explain this form
            </Button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-slate-500" />
                </button>

                <div className="p-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Why Daily Reports Matter</h2>

                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="mt-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-2 rounded-lg h-fit">
                                <span className="text-xl">💰</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Drives Foreman & Crew Payroll</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    The "Labor" section generates timecards. If hours aren't logged here, payroll can't be processed accurately.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="mt-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 p-2 rounded-lg h-fit">
                                <span className="text-xl">🚜</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Tracks Equipment Costs</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Logging "Equipment Usage" helps us track maintenance cycles and job profitability.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="mt-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 p-2 rounded-lg h-fit">
                                <span className="text-xl">📊</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Project Progress</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    "Production" stats update the main dashboard so the office knows exactly how much footage we bored today.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <Button onClick={() => setIsOpen(false)} className="px-8">
                            Close Tour
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
