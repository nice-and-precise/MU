"use client";

import React from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface FluidAlertProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function FluidAlert({ open, onOpenChange }: FluidAlertProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-red-950 border-red-700 text-white">
                <AlertDialogHeader>
                    <div className="flex items-center gap-4 text-red-500 mb-4">
                        <AlertTriangle className="h-16 w-16 text-red-500 animate-pulse" />
                        <AlertDialogTitle className="text-3xl font-black text-white">STOP WORK IMMEDIATELY</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-xl text-red-100 font-bold">
                        TOTAL FLUID LOSS DETECTED.
                        <br />
                        <br />
                        1. STOP THE DRILL.
                        <br />
                        2. INSPECT THE SURFACE FOR FRAC-OUT.
                        <br />
                        3. NOTIFY THE PROJECT MANAGER.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction
                        onClick={() => onOpenChange(false)}
                        className="bg-white text-red-900 hover:bg-gray-200 font-bold text-lg h-14 w-full"
                    >
                        I HAVE STOPPED THE DRILL
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
