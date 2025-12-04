"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="flex justify-center mb-8">
                    <div className="bg-red-500 p-4 rounded-full bg-opacity-10">
                        <AlertTriangle className="w-16 h-16 text-red-500" />
                    </div>
                </div>

                <h1 className="text-4xl font-bold tracking-tighter text-red-500">System Error</h1>
                <p className="text-slate-400">
                    An unexpected error occurred. Our engineering team has been notified.
                </p>

                <div className="pt-8 space-x-4">
                    <Button onClick={() => reset()} variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800">
                        Try Again
                    </Button>
                    <Button onClick={() => window.location.href = '/dashboard'} className="bg-red-600 hover:bg-red-700 text-white">
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
}
