"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createDamageEvent } from "@/actions/216d/compliance";
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

const damageSchema = z.object({
    facilityType: z.string().min(1, "Facility type is required"),
    description: z.string().min(1, "Description is required"),
    contactMade: z.boolean().default(true),
});

type DamageValues = z.infer<typeof damageSchema>;

interface DamageFormProps {
    projectId: string;
    ticketId?: string;
    onClose: () => void;
}

export function DamageForm({ projectId, ticketId, onClose }: DamageFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<DamageValues>({
        resolver: zodResolver(damageSchema),
        defaultValues: {
            facilityType: "UNKNOWN",
            description: "",
            contactMade: true,
        },
    });

    const onSubmit = async (data: DamageValues) => {
        setLoading(true);
        try {
            await createDamageEvent({
                projectId,
                ticketId,
                facilityType: data.facilityType,
                description: data.description,
                contactWasMade: data.contactMade
            });
            toast.success("Damage reported successfully");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to report damage");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
                    <h3 className="text-red-800 font-bold">Report Damage / Contact</h3>
                    <p className="text-sm text-red-600">Ensure emergency services are contacted if gas or hazardous.</p>
                </div>

                <FormField
                    control={form.control}
                    name="facilityType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Facility Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="GAS">Gas</SelectItem>
                                    <SelectItem value="ELECTRIC">Electric</SelectItem>
                                    <SelectItem value="WATER">Water</SelectItem>
                                    <SelectItem value="FIBER">Fiber/Comms</SelectItem>
                                    <SelectItem value="SEWER">Sewer</SelectItem>
                                    <SelectItem value="UNKNOWN">Unknown</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Describe the damage and location..."
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" variant="destructive" disabled={loading} className="w-full">
                    {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                    Report Damage
                </Button>
            </form>
        </Form>
    );
}
