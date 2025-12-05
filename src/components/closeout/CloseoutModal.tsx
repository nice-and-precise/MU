'use client';

import { useState } from 'react';
import { archiveProject } from '@/actions/closeout';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle2, AlertTriangle, Archive, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CloseoutModalProps {
    projectId: string;
    summary: any;
}

export default function CloseoutModal({ projectId, summary }: CloseoutModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const checks = [
        {
            label: 'All Punch Items Closed',
            passed: summary.qc.openPunchItems === 0,
            details: `${summary.qc.openPunchItems} open items`
        },
        {
            label: 'Final Invoice Sent (Optional)',
            passed: true, // Soft check for now
            details: 'Check manually'
        },
        {
            label: 'Site Demobilized',
            passed: true, // Manual confirmation
            details: 'Confirm equipment removed'
        }
    ];

    const allPassed = checks.every(c => c.passed);

    const handleArchive = async () => {
        setLoading(true);
        const res = await archiveProject(projectId);
        if (res?.data?.success) {
            setOpen(false);
            router.refresh();
        } else {
            alert(res?.error || 'Failed to archive project');
        }
        setLoading(false);
    };

    if (summary.status === 'ARCHIVED') {
        return (
            <Button variant="outline" disabled className="w-full">
                <Archive className="w-4 h-4 mr-2" /> Project Archived
            </Button>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                    <Archive className="w-4 h-4 mr-2" /> Archive Project
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Project Closeout</DialogTitle>
                    <DialogDescription>
                        Verify all requirements are met before archiving this project.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {checks.map((check, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                                {check.passed ?
                                    <CheckCircle2 className="w-5 h-5 text-green-500" /> :
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                }
                                <div>
                                    <p className="font-medium">{check.label}</p>
                                    <p className="text-xs text-muted-foreground">{check.details}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        variant="destructive"
                        onClick={handleArchive}
                        disabled={!allPassed || loading}
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Confirm Archive'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
