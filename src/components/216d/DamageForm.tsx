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
} from "@/components/ui/form";
import { FormLayout } from "@/components/ui/FormLayout";
import { Loader2 } from "lucide-react";

const damageSchema = z.object({
    facilityType: z.string().min(1, "Facility type is required"),
    description: z.string().min(1, "Description is required"),
    contactMade: z.boolean(),
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
        resolver: zodResolver(damageSchema) as any,
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

                <FormLayout
                    name="facilityType"
                    label="Facility Type"
                    children={(field) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="GAS">Gas</SelectItem>
                                <SelectItem value="ELECTRIC">Electric</SelectItem>
                                <SelectItem value="WATER">Water</SelectItem>
                                <SelectItem value="FIBER">Fiber/Comms</SelectItem>
                                <SelectItem value="SEWER">Sewer</SelectItem>
                                <SelectItem value="UNKNOWN">Unknown</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />

                <FormLayout
                    name="description"
                    label="Description"
                    children={(field) => (
                        <Textarea
                            placeholder="Describe the damage and location..."
                            {...field}
                        />
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
