'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bug, X, Check, MousePointer2, Loader2, Terminal, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toPng } from 'html-to-image';
import { useSession } from 'next-auth/react';

export function FeedbackWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isInspecting, setIsInspecting] = useState(false);
    const [selectedElement, setSelectedElement] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
    const pathname = usePathname();
    const highlightRef = useRef<HTMLDivElement | null>(null);
    const { data: session } = useSession();

    // Capture console logs
    useEffect(() => {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        const handleLog = (type: string, args: any[]) => {
            const message = args.map(arg => {
                if (typeof arg === 'object') {
                    try {
                        return JSON.stringify(arg);
                    } catch (e) {
                        return '[Circular/Unserializable Object]';
                    }
                }
                return String(arg);
            }).join(' ');
            setConsoleLogs(prev => [`[${type.toUpperCase()}] ${message}`, ...prev].slice(0, 50));
        };

        console.log = (...args) => {
            // Defer state update to avoid "Cannot update a component while rendering a different component"
            setTimeout(() => handleLog('log', args), 0);
            originalLog.apply(console, args);
        };
        console.error = (...args) => {
            setTimeout(() => handleLog('error', args), 0);
            originalError.apply(console, args);
        };
        console.warn = (...args) => {
            setTimeout(() => handleLog('warn', args), 0);
            originalWarn.apply(console, args);
        };

        return () => {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
        };
    }, []);

    // Create highlight overlay
    useEffect(() => {
        if (!highlightRef.current) {
            const div = document.createElement('div');
            div.style.position = 'fixed';
            div.style.border = '2px solid #ef4444';
            div.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            div.style.pointerEvents = 'none';
            div.style.zIndex = '9999';
            div.style.display = 'none';
            div.style.transition = 'all 0.1s ease';
            div.style.borderRadius = '4px';
            div.style.boxShadow = '0 0 0 2px rgba(255, 255, 255, 0.2)';
            document.body.appendChild(div);
            highlightRef.current = div;
        }
        return () => {
            if (highlightRef.current) {
                document.body.removeChild(highlightRef.current);
                highlightRef.current = null;
            }
        };
    }, []);

    // Inspection mode logic
    useEffect(() => {
        if (!isInspecting) {
            if (highlightRef.current) highlightRef.current.style.display = 'none';
            return;
        }

        const handleMouseOver = (e: MouseEvent) => {
            if (!highlightRef.current) return;
            const target = e.target as HTMLElement;
            // Don't highlight the widget itself
            if (target.closest('#feedback-widget-container')) return;

            const rect = target.getBoundingClientRect();
            highlightRef.current.style.display = 'block';
            highlightRef.current.style.top = `${rect.top}px`;
            highlightRef.current.style.left = `${rect.left}px`;
            highlightRef.current.style.width = `${rect.width}px`;
            highlightRef.current.style.height = `${rect.height}px`;
        };

        const handleClick = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const target = e.target as HTMLElement;
            if (target.closest('#feedback-widget-container')) return;

            // Generate a simple selector
            const tag = target.tagName.toLowerCase();
            const id = target.id ? `#${target.id}` : '';
            const classes = Array.from(target.classList).map(c => `.${c}`).join('');
            const selector = `${tag}${id}${classes}`;

            // Get text content preview
            const textPreview = target.innerText.slice(0, 50) + (target.innerText.length > 50 ? '...' : '');

            setSelectedElement(`${selector} (${textPreview})`);
            setIsInspecting(false);
            setIsOpen(true);
            if (highlightRef.current) highlightRef.current.style.display = 'none';
        };

        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('click', handleClick, true); // Capture phase

        return () => {
            document.removeEventListener('mouseover', handleMouseOver);
            document.removeEventListener('click', handleClick, true);
        };
    }, [isInspecting]);

    // Screenshot logic
    useEffect(() => {
        if (isOpen && !screenshot) {
            // Ensure highlight is hidden
            if (highlightRef.current) highlightRef.current.style.display = 'none';

            toPng(document.body, { cacheBust: true })
                .then((dataUrl) => {
                    setScreenshot(dataUrl);
                })
                .catch((err) => {
                    console.error('Failed to capture screenshot:', err);
                });
        } else if (!isOpen) {
            setScreenshot(null);
        }
    }, [isOpen, screenshot]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const report = {
                description,
                element: selectedElement,
                path: pathname,
                userAgent: navigator.userAgent,
                screenSize: `${window.innerWidth}x${window.innerHeight}`,
                timestamp: new Date().toISOString(),
                screenshot,
                consoleLogs,
                userInfo: session?.user ? {
                    name: session.user.name,
                    email: session.user.email,
                } : null,
            };

            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(report),
            });

            let data;
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await res.json();
            } else {
                // Handle non-JSON response (likely HTML error page)
                const text = await res.text();
                console.error("Received non-JSON response from feedback API:", text.slice(0, 200));
                throw new Error(`Server returned ${res.status} ${res.statusText}`);
            }

            if (res.ok && data.success) {
                setIsOpen(false);
                setDescription('');
                setSelectedElement(null);
                setScreenshot(null);
                alert('Feedback submitted successfully!');
            } else {
                alert(`Failed to submit feedback: ${data?.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error(error);
            alert('Error submitting feedback. Check console for details.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div id="feedback-widget-container" className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2 font-sans">
            {isOpen && (
                <Card className="w-96 shadow-2xl border-border/50 backdrop-blur-md bg-background/95 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                        <div>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Bug className="h-4 w-4 text-primary" />
                                Report Issue
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Help us improve the platform.
                            </CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-2" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">Target Element</Label>
                            <div className="flex gap-2">
                                <div className="flex-1 p-2 bg-muted/50 rounded text-xs font-mono truncate border border-border/50 flex items-center gap-2">
                                    <MousePointer2 className="h-3 w-3 opacity-50" />
                                    {selectedElement || 'No element selected'}
                                </div>
                                <Button
                                    variant={isInspecting ? "destructive" : "outline"}
                                    size="icon"
                                    className="h-9 w-9 shrink-0"
                                    onClick={() => {
                                        setIsOpen(false);
                                        setIsInspecting(true);
                                    }}
                                    title="Select Element"
                                >
                                    <MousePointer2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {screenshot && (
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground">Screenshot Preview</Label>
                                <div className="relative aspect-video w-full overflow-hidden rounded border border-border/50 bg-muted/50 group">
                                    <img src={screenshot} alt="Screenshot" className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-xs font-medium text-muted-foreground">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe the issue or suggestion..."
                                className="resize-none text-sm bg-background/50"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1" title="Console Logs Captured">
                                <Terminal className="h-3 w-3" />
                                {consoleLogs.length} logs
                            </div>
                            {session?.user && (
                                <div className="flex items-center gap-1" title="User Authenticated">
                                    <User className="h-3 w-3" />
                                    {session.user.name}
                                </div>
                            )}
                        </div>

                        <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting || !description}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                            Submit Report
                        </Button>
                    </CardContent>
                </Card>
            )}

            {!isOpen && (
                <div className="flex gap-2 group">
                    {isInspecting && (
                        <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-pulse flex items-center gap-2">
                            <MousePointer2 className="h-4 w-4" />
                            Click any element to select it
                        </div>
                    )}
                    <Button
                        size="lg"
                        className={cn(
                            "rounded-full shadow-lg h-12 w-12 p-0 transition-all duration-300 hover:scale-110",
                            isInspecting ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
                        )}
                        onClick={() => isInspecting ? setIsInspecting(false) : setIsOpen(true)}
                    >
                        {isInspecting ? <X className="h-6 w-6" /> : <Bug className="h-6 w-6" />}
                    </Button>
                </div>
            )}
        </div>
    );
}
