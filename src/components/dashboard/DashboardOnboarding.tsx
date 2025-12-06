'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { completeOnboarding } from '@/actions/userAttributes';
import { toast } from 'sonner';
import { CheckCircle2, ChevronRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DashboardOnboardingProps {
    role: string;
    hasCompletedOnboarding: boolean;
    userName?: string;
}

export function DashboardOnboarding({ role, hasCompletedOnboarding, userName }: DashboardOnboardingProps) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!hasCompletedOnboarding) {
            // Small delay to let the UI load first
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [hasCompletedOnboarding]);

    const handleComplete = async () => {
        setIsOpen(false);
        const res = await completeOnboarding();
        if (res.success) {
            toast.success("Welcome aboard! Your profile has been updated.");
            router.refresh();
        } else {
            console.error(res.error);
        }
    };

    const getRoleContent = () => {
        if (role === 'OWNER') {
            return {
                title: "Welcome to your Command Center",
                steps: [
                    { label: "Review Command Center KPIs", action: () => { } }, // We can add scroll-to logic later
                    { label: "Open Projects List", action: () => router.push('/dashboard/projects') },
                    { label: "Invite a Foreman", action: () => router.push('/dashboard/settings') },
                ]
            };
        } else {
            return {
                title: "Ready to hit the ground running?",
                steps: [
                    { label: "Log your first Daily Report", action: () => router.push('/dashboard/daily-reports/new') },
                    { label: "Add a punch item", action: () => router.push('/dashboard/qc') },
                    { label: "View Active Projects", action: () => router.push('/dashboard/projects') },
                ]
            };
        }
    };

    const content = getRoleContent();

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <span>👋</span> {content.title}
                    </DialogTitle>
                    <DialogDescription className="pt-2 text-base">
                        Hi {userName || 'there'}, here are a few things to get you started with your new role as <strong>{role}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {content.steps.map((step, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group" onClick={step.action}>
                            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                {index + 1}
                            </div>
                            <div className="flex-1 font-medium text-slate-700 group-hover:text-slate-900">
                                {step.label}
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                        </div>
                    ))}
                </div>

                <DialogFooter className="sm:justify-between flex-row items-center gap-2">
                    <Button variant="ghost" className="text-slate-500" onClick={handleComplete}>
                        Skip for now
                    </Button>
                    <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Onboarding Complete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
