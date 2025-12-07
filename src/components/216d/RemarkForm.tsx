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
} from "@/components/ui/form";
import { FormLayout } from "@/components/ui/FormLayout";
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
                <FormLayout
                    name="type"
                    label="Remark Type"
                    children={(field) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="REMARK_REQUESTED">Request Remark</SelectItem>
                                <SelectItem value="REMARK_COMPLETED">Record Completed Remark</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />

                <FormLayout
                    name="reason"
                    label="Reason"
                    children={(field) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MARKS_OBLITERATED">Marks Obliterated</SelectItem>
                                <SelectItem value="WRONG_LOCATION">Wrong Location</SelectItem>
                                <SelectItem value="ADDITIONAL_AREA">Additional Area</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />

                <FormLayout
                    name="notes"
                    label="Notes"
                    children={(field) => (
                        <Textarea {...field} />
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
