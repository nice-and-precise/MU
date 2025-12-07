'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, X, Calendar, FileText, Activity, AlertCircle } from 'lucide-react';

export function TimelineTour() {
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
                Guide
            </Button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-slate-500" />
                </button>

                <div className="p-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Project Lifecycle Timeline</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">
                        View the complete chronological history of your project, from initial estimate to final delivery.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="flex gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="mt-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-2 rounded-full h-fit">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Estimating & Changes</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Track when estimates were created, approved, and when change orders modified the scope.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="mt-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 p-2 rounded-full h-fit">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Field Operations</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    See when bores are planned, started, and completed, along with daily production milestones.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="mt-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-full h-fit">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Quality Control</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Monitor punch items as they are raised and resolved to ensure quality standards.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="mt-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-full h-fit">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Project Milestones</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Key dates like project creation, start date, and target completion are highlighted.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={() => setIsOpen(false)}
                        className="w-full py-6 text-lg font-bold"
                    >
                        Explore Timeline
                    </Button>
                </div>
            </div>
        </div>
    );
}
