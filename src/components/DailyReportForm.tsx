"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, WifiOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { OfflineQueue } from "@/lib/offline-queue";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { DailyReportTour } from "@/components/daily-reports/DailyReportTour";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
    projectId: z.string().min(1, "Project is required"),
    reportDate: z.string().min(1, "Date is required"),
    notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DailyReportForm({ projects }: { projects: any[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            projectId: "",
            reportDate: new Date().toISOString().split("T")[0],
            notes: "",
        },
    });

    const onSubmit = async (data: FormValues) => {
        setLoading(true);
        try {
            if (!navigator.onLine) {
                OfflineQueue.add('DAILY_REPORT', data);
                toast.success("Offline: Report saved to drafts queue.");
                router.push("/dashboard/reports");
                return;
            }

            const { createDailyReport } = await import("@/actions/reports");
            const result = await createDailyReport(data);

            if (!result.success) {
                console.error("Server Action Failed:", result.error);
                toast.error(result.error || "Failed to create report");
                return;
            }

            toast.success("Daily report created successfully");
            // Redirect to the edit wizard to fill in details
            router.push(`/dashboard/reports/${result.data.id}`);
        } catch (error: any) {
            console.error("Error submitting report:", error);
            toast.error(error.message || "Failed to create report");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-xl shadow-sm border border-border">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-3 justify-between">
                    <div className="flex items-start gap-3">
                        <div className="bg-blue-100 dark:bg-blue-800 p-1 rounded-full shrink-0">
                            <span className="text-blue-600 dark:text-blue-300 text-xs font-bold px-2">OFFICE IMPACT</span>
                        </div>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            Approving this Daily Report creates timecards and equipment usage for payroll and costs.
                        </p>
                    </div>
                    <DailyReportTour />
                </div>

                <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel required>Project</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a project..." />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {projects.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="reportDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel required>Date</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea rows={4} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    disabled={loading}
                    variant="secondary"
                    className="w-full font-bold"
                >
                    {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
                    {loading ? "Creating..." : "Create Report"}
                </Button>
            </form>
        </Form>
    );
}
