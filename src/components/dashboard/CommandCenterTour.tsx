'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, X } from 'lucide-react';

export function CommandCenterTour() {
    const [isOpen, setIsOpen] = useState(false);

    if (!isOpen) {
        return (
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="gap-2"
            >
                <HelpCircle className="w-4 h-4" />
                Tour
            </Button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-slate-500" />
                </button>

                <div className="p-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Command Center Overview</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xl">
                        This dashboard aggregates real-time data from the field to give you a complete operational picture.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                <h3 className="font-bold text-slate-900 dark:text-white">Active Projects & Fleet</h3>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Live count of active sites and equipment. Click "Active Projects" to see detailed status and drill progress.
                            </p>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <h3 className="font-bold text-slate-900 dark:text-white">Financials</h3>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Revenue is estimated based on completed daily production quantities × unit prices.
                            </p>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                <h3 className="font-bold text-slate-900 dark:text-white">Pending Approvals</h3>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Daily Reports and Timecards waiting for your review. Approving these triggers payroll and invoicing.
                            </p>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                <h3 className="font-bold text-slate-900 dark:text-white">Map & Live Ops</h3>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                The map shows real-time crew locations. Switch to "Live Tracking" for detailed telemetry feeds.
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={() => setIsOpen(false)}
                        className="w-full py-6 text-lg font-bold"
                    >
                        Got it, thanks!
                    </Button>
                </div>
            </div>
        </div>
    );
}
