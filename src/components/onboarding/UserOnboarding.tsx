"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { updateUserPreferences } from "@/actions/user";
import { toast } from "sonner";
import { User } from "next-auth";
import { useRouter } from "next/navigation";

interface UserOnboardingProps {
    user: User & { phone?: string | null; preferences?: any };
}

export function UserOnboarding({ user }: UserOnboardingProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Form State
    const [phone, setPhone] = useState(user.phone || "");
    const [email] = useState(user.email || "");
    const [notifications, setNotifications] = useState(true);

    useEffect(() => {
        // Check if onboarding is complete based on preferences
        // preferences might be a string or object depending on how it's passed, 
        // but typically we parse it before passing or in the parent.
        // For now, let's assume parent passes parsed preferences or we check the raw string?
        // Actually, let's logic be: If we don't have a phone number OR explicit 'onboardingComplete' flag.

        let prefs: any = {};
        try {
            if (typeof user.preferences === 'string') {
                prefs = JSON.parse(user.preferences);
            } else {
                prefs = user.preferences || {};
            }
        } catch (e) {
            prefs = {};
        }

        if (!prefs.onboardingComplete) {
            setOpen(true);
        }
    }, [user]);

    const handleComplete = async () => {
        setLoading(true);
        try {
            // we need to call an action that:
            // 1. Updates phone number (if changed)
            // 2. Updates preferences to { ...existing, onboardingComplete: true, notifications }

            await updateUserPreferences({
                phone,
                onboardingComplete: true,
                notifications
            });

            setOpen(false);
            toast.success("Welcome aboard! Your profile is set up.");
            router.refresh();
        } catch (error) {
            toast.error("Failed to save profile. Please try again.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Welcome to Midwest Underground Ops</DialogTitle>
                    <DialogDescription>
                        Let's get your profile set up so you can start receiving tickets and updates.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                                <p className="font-semibold mb-1">Role: {user.role}</p>
                                <p>You have been assigned the <strong>{user.role}</strong> role. This determines what features you can access.</p>
                            </div>
                            <Button className="w-full" onClick={() => setStep(2)}>Get Started</Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" value={email} disabled />
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="phone">Mobile Phone</Label>
                                <Input
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="555-123-4567"
                                />
                                <p className="text-xs text-gray-500">Required for urgent ticket alerts.</p>
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox
                                    id="notif"
                                    checked={notifications}
                                    onCheckedChange={(c) => setNotifications(!!c)}
                                />
                                <Label htmlFor="notif" className="text-sm font-normal">
                                    Enable email notifications for new assignments
                                </Label>
                            </div>

                            <Button className="w-full" onClick={handleComplete} disabled={loading || !phone}>
                                {loading ? "Saving..." : "Complete Setup"}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
