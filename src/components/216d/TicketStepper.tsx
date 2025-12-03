"use client";

import { Check, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
    id: string;
    title: string;
    description: string;
    status: "pending" | "current" | "completed";
}

interface TicketStepperProps {
    steps: Step[];
    currentStepId: string;
}

export function TicketStepper({ steps, currentStepId }: TicketStepperProps) {
    return (
        <nav aria-label="Progress">
            <ol role="list" className="overflow-hidden rounded-md lg:flex lg:rounded-none lg:border-l lg:border-r lg:border-gray-200">
                {steps.map((step, stepIdx) => (
                    <li key={step.id} className="relative overflow-hidden lg:flex-1">
                        <div
                            className={cn(
                                stepIdx === 0 ? "rounded-t-md border-b-0" : "",
                                stepIdx === steps.length - 1 ? "rounded-b-md border-t-0" : "",
                                "overflow-hidden border border-gray-200 lg:border-0"
                            )}
                        >
                            {step.status === "completed" ? (
                                <div className="group">
                                    <span
                                        className="absolute left-0 top-0 h-full w-1 bg-transparent group-hover:bg-gray-200 lg:bottom-0 lg:top-auto lg:h-1 lg:w-full"
                                        aria-hidden="true"
                                    />
                                    <span className={cn(stepIdx !== 0 ? "lg:pl-9" : "", "flex items-start px-6 py-5 text-sm font-medium")}>
                                        <span className="flex-shrink-0">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600">
                                                <Check className="h-6 w-6 text-white" aria-hidden="true" />
                                            </span>
                                        </span>
                                        <span className="ml-4 mt-0.5 flex min-w-0 flex-col">
                                            <span className="text-sm font-medium text-emerald-600">{step.title}</span>
                                            <span className="text-sm text-gray-500">{step.description}</span>
                                        </span>
                                    </span>
                                </div>
                            ) : step.status === "current" ? (
                                <div aria-current="step">
                                    <span
                                        className="absolute left-0 top-0 h-full w-1 bg-emerald-600 lg:bottom-0 lg:top-auto lg:h-1 lg:w-full"
                                        aria-hidden="true"
                                    />
                                    <span className={cn(stepIdx !== 0 ? "lg:pl-9" : "", "flex items-start px-6 py-5 text-sm font-medium")}>
                                        <span className="flex-shrink-0">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-emerald-600">
                                                <span className="text-emerald-600">0{stepIdx + 1}</span>
                                            </span>
                                        </span>
                                        <span className="ml-4 mt-0.5 flex min-w-0 flex-col">
                                            <span className="text-sm font-medium text-emerald-600">{step.title}</span>
                                            <span className="text-sm text-gray-500">{step.description}</span>
                                        </span>
                                    </span>
                                </div>
                            ) : (
                                <div className="group">
                                    <span
                                        className="absolute left-0 top-0 h-full w-1 bg-transparent group-hover:bg-gray-200 lg:bottom-0 lg:top-auto lg:h-1 lg:w-full"
                                        aria-hidden="true"
                                    />
                                    <span className={cn(stepIdx !== 0 ? "lg:pl-9" : "", "flex items-start px-6 py-5 text-sm font-medium")}>
                                        <span className="flex-shrink-0">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300">
                                                <span className="text-gray-500">0{stepIdx + 1}</span>
                                            </span>
                                        </span>
                                        <span className="ml-4 mt-0.5 flex min-w-0 flex-col">
                                            <span className="text-sm font-medium text-gray-500">{step.title}</span>
                                            <span className="text-sm text-gray-500">{step.description}</span>
                                        </span>
                                    </span>
                                </div>
                            )}

                            {stepIdx !== 0 ? (
                                <>
                                    {/* Separator */}
                                    <div className="absolute inset-0 top-0 left-0 hidden w-3 lg:block" aria-hidden="true">
                                        <svg
                                            className="h-full w-full text-gray-300"
                                            viewBox="0 0 12 82"
                                            fill="none"
                                            preserveAspectRatio="none"
                                        >
                                            <path d="M0.5 0V31L10.5 41L0.5 51V82" stroke="currentcolor" vectorEffect="non-scaling-stroke" />
                                        </svg>
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
