"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

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
            const { createDailyReport } = await import("@/actions/reports");
            await createDailyReport(data);
            toast.success("Daily report created successfully");
            router.push("/dashboard/reports");
            router.refresh();
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
                <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Project</FormLabel>
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
                            <FormLabel>Date</FormLabel>
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
