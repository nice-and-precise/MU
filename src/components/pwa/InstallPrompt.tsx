"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom duration-300">
            <div className="bg-gray-900 border border-gray-700 text-white p-4 rounded-lg shadow-xl flex items-center justify-between">
                <div className="flex-1">
                    <p className="font-semibold text-sm">Install App</p>
                    <p className="text-xs text-gray-400">Install Midwest Underground for a better field experience.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        onClick={handleInstallClick}
                        className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs font-semibold"
                    >
                        <Download className="h-4 w-4 mr-1.5" />
                        Install
                    </Button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-1 hover:bg-gray-800 rounded text-gray-400"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
