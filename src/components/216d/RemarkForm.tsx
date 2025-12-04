"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createLocateRemark } from "@/actions/216d/compliance";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const remarkSchema = z.object({
    type: z.string().min(1, "Type is required"),
    reason: z.string().min(1, "Reason is required"),
    notes: z.string().optional(),
});

type RemarkValues = z.infer<typeof remarkSchema>;

interface RemarkFormProps {
    projectId: string;
    ticketId: string;
    onClose: () => void;
}

export function RemarkForm({ projectId, ticketId, onClose }: RemarkFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<RemarkValues>({
        resolver: zodResolver(remarkSchema),
        defaultValues: {
            type: "REMARK_REQUESTED",
            reason: "MARKS_OBLITERATED",
            notes: "",
        },
    });

    const onSubmit = async (data: RemarkValues) => {
        setLoading(true);
        try {
            await createLocateRemark({
                projectId,
                ticketId,
                type: data.type,
                reason: data.reason,
                notes: data.notes
            });
            toast.success("Remark request submitted successfully");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit remark request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Remark Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="REMARK_REQUESTED">Request Remark</SelectItem>
                                    <SelectItem value="REMARK_COMPLETED">Record Completed Remark</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Reason</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="MARKS_OBLITERATED">Marks Obliterated</SelectItem>
                                    <SelectItem value="WRONG_LOCATION">Wrong Location</SelectItem>
                                    <SelectItem value="ADDITIONAL_AREA">Additional Area</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
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
                                <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={loading} className="w-full bg-amber-600 hover:bg-amber-700">
                    {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                    Submit Remark Request
                </Button>
            </form>
        </Form>
    );
}
