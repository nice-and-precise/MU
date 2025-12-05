"use client";

import { useState } from "react";
import { TicketStepper } from "./TicketStepper";
import { WhiteLiningForm } from "./WhiteLiningForm";
import { GsocTicketForm } from "./GsocTicketForm";
import { MeetTicketForm } from "./MeetTicketForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface ComplianceTabProps {
    projectId: string;
}

export function ComplianceTab({ projectId }: ComplianceTabProps) {
    const [currentStep, setCurrentStep] = useState("white-lining");
    const [complianceData, setComplianceData] = useState<any>({});

    const steps = [
        {
            id: "white-lining",
            title: "White Lining",
            description: "Document physical markings",
            status: complianceData.whiteLining ? "completed" : currentStep === "white-lining" ? "current" : "pending",
        },
        {
            id: "gsoc-ticket",
            title: "GSOC Ticket",
            description: "File and confirm ticket",
            status: complianceData.gsocTicket ? "completed" : currentStep === "gsoc-ticket" ? "current" : "pending",
        },
        {
            id: "meet-ticket",
            title: "Meet Ticket",
            description: "If required (>1 mile)",
            status: complianceData.meetTicket ? "completed" : currentStep === "meet-ticket" ? "current" : "pending",
        },
    ] as any[];

    const handleWhiteLiningComplete = (data: any) => {
        setComplianceData({ ...complianceData, whiteLining: data });
        setCurrentStep("gsoc-ticket");
    };

    const handleGsocTicketComplete = (data: any) => {
        setComplianceData({ ...complianceData, gsocTicket: data });
        if (data.ticketType === "MEET") {
            setCurrentStep("meet-ticket");
        } else {
            setCurrentStep("complete");
        }
    };

    const handleMeetTicketComplete = (data: any) => {
        setComplianceData({ ...complianceData, meetTicket: data });
        setCurrentStep("complete");
    };

    return (
        <div className="space-y-6">
            <TicketStepper steps={steps} currentStepId={currentStep} />

            <div className="mt-6">
                {currentStep === "white-lining" && (
                    <WhiteLiningForm projectId={projectId} onComplete={handleWhiteLiningComplete} />
                )}

                {currentStep === "gsoc-ticket" && (
                    <GsocTicketForm projectId={projectId} onComplete={handleGsocTicketComplete} />
                )}

                {currentStep === "meet-ticket" && (
                    <MeetTicketForm
                        projectId={projectId}
                        ticketId={complianceData.gsocTicket?.id}
                        onComplete={handleMeetTicketComplete}
                    />
                )}

                {currentStep === "complete" && (
                    <Card className="bg-emerald-50 border-emerald-200">
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-8 w-8 text-emerald-600" />
                                <CardTitle className="text-emerald-800">Ready to Dig</CardTitle>
                            </div>
                            <CardDescription className="text-emerald-700">
                                All 216D compliance steps have been completed.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-white dark:bg-emerald-950/30 rounded-md border border-emerald-100 dark:border-emerald-900">
                                    <p className="text-sm text-gray-500">Legal Locate Ready</p>
                                    <p className="font-bold text-gray-900">
                                        {complianceData.gsocTicket?.legalReady?.toLocaleString() || "N/A"}
                                    </p>
                                </div>
                                <div className="p-4 bg-white dark:bg-emerald-950/30 rounded-md border border-emerald-100 dark:border-emerald-900">
                                    <p className="text-sm text-gray-500">Ticket Number</p>
                                    <p className="font-bold text-gray-900">
                                        {complianceData.gsocTicket?.ticketNumber || "N/A"}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                                    onClick={async () => {
                                        const toastId = toast.loading("Generating 216D Packet...");
                                        try {
                                            // 1. Fetch Data
                                            const { downloadCompliancePacket } = await import("@/actions/216d/packet");
                                            const res = await downloadCompliancePacket(complianceData.gsocTicket?.id);

                                            if (!res.success || !res.data) {
                                                toast.error(res.error || "Failed to fetch packet data", { id: toastId });
                                                return;
                                            }

                                            const packetData = JSON.parse(res.data);

                                            // 2. Generate PDF Client-Side
                                            const { generateCompliancePacketPDF } = await import("@/lib/compliance/PacketGenerator");
                                            const blob = await generateCompliancePacketPDF(packetData);

                                            // 3. Download
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement("a");
                                            a.href = url;
                                            a.download = `216D_Compliance_${packetData.ticket.ticketNumber}.pdf`;
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                            URL.revokeObjectURL(url);

                                            toast.success("Packet Downloaded", { id: toastId });
                                        } catch (e) {
                                            console.error(e);
                                            toast.error("Failed to generate packet", { id: toastId });
                                        }
                                    }}
                                >
                                    Download Compliance Packet (PDF)
                                </Button>

                                {!complianceData.submitted ? (
                                    <Button
                                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                                        onClick={async () => {
                                            if (confirm("Confirm final submission to ITICnxt? This will lock the ticket.")) {
                                                const toastId = toast.loading("Submitting to ITICnxt...");
                                                try {
                                                    const { submitTicketToItic } = await import("@/actions/iticnxt");
                                                    const result = await submitTicketToItic({
                                                        ticketId: complianceData.gsocTicket?.id,
                                                        projectId
                                                    });

                                                    if (result?.data?.ticketNumber) {
                                                        setComplianceData((prev: any) => ({
                                                            ...prev,
                                                            submitted: true,
                                                            gsocTicket: {
                                                                ...prev.gsocTicket,
                                                                ticketNumber: result.data?.ticketNumber
                                                            }
                                                        }));
                                                        toast.success(`Ticket Submitted! Official #: ${result.data.ticketNumber}`, { id: toastId });
                                                    } else {
                                                        const errorMsg = result?.error || "Submission failed";
                                                        toast.error(`Submission Failed: ${errorMsg}`, { id: toastId });
                                                    }
                                                } catch (error) {
                                                    toast.error("An unexpected error occurred", { id: toastId });
                                                }
                                            }
                                        }}
                                    >
                                        Submit to ITICnxt (Live API)
                                    </Button>
                                ) : (
                                    <div className="p-2 bg-emerald-100 text-emerald-800 text-center rounded font-bold border border-emerald-200">
                                        ✓ Submitted to ITICnxt
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div >
    );
}
