"use client";

import React, { createContext, useContext, useState } from 'react';
import { HELP_CONTENT } from '@/config/help';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
// import ReactMarkdown from 'react-markdown'; 

// Simple context to toggle help
interface HelpContextType {
    showHelp: (key: string) => void;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export function HelpProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentKey, setCurrentKey] = useState<string | null>(null);

    const showHelp = (key: string) => {
        if (HELP_CONTENT[key]) {
            setCurrentKey(key);
            setIsOpen(true);
        } else {
            console.warn(`No help content found for key: ${key}`);
        }
    };

    const activeContent = currentKey ? HELP_CONTENT[currentKey] : null;

    return (
        <HelpContext.Provider value={{ showHelp }}>
            {children}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    {activeContent && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{activeContent.title}</DialogTitle>
                            </DialogHeader>
                            <div className="prose dark:prose-invert mt-4">
                                <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                                    {activeContent.content}
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </HelpContext.Provider>
    );
}

export const useHelp = () => {
    const context = useContext(HelpContext);
    if (!context) {
        throw new Error('useHelp must be used within a HelpProvider');
    }
    return context;
};
