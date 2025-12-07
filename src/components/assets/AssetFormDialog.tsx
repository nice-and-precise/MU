'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createAsset, updateAsset } from '@/actions/assets';
import { Asset } from '@prisma/client';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
    Form,
} from "@/components/ui/form";
import { FormLayout } from '@/components/ui/FormLayout';
import { Loader2 } from 'lucide-react';

const assetSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(['RIG', 'LOCATOR', 'EXCAVATOR', 'TRUCK', 'OTHER']),
    model: z.string().optional(),
    serialNumber: z.string().optional(),
    status: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED']),
    location: z.string().optional(),
});

type AssetValues = z.infer<typeof assetSchema>;

interface AssetFormDialogProps {
    asset?: Asset;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function AssetFormDialog({ asset, trigger, open, onOpenChange }: AssetFormDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isEdit = !!asset;
    const [loading, setLoading] = useState(false);

    const form = useForm<AssetValues>({
        resolver: zodResolver(assetSchema),
        defaultValues: {
            name: asset?.name || '',
            type: (asset?.type as any) || 'RIG',
            model: asset?.model || '',
            serialNumber: asset?.serialNumber || '',
            status: (asset?.status as any) || 'AVAILABLE',
            location: asset?.location || '',
        },
    });

    const handleOpenChange = (newOpen: boolean) => {
        setInternalOpen(newOpen);
        onOpenChange?.(newOpen);
        if (!newOpen && !isEdit) {
            form.reset();
        }
    };

    const onSubmit = async (data: AssetValues) => {
        setLoading(true);
        try {
            if (isEdit && asset) {
                await updateAsset({ id: asset.id, data: data as any });
                toast.success("Asset updated successfully");
            } else {
                await createAsset(data as any);
                toast.success("Asset created successfully");
            }
            handleOpenChange(false);
        } catch (error) {
            console.error('Failed to save asset', error);
            toast.error("Failed to save asset");
        } finally {
            setLoading(false);
        }
    };

    const effectiveOpen = open !== undefined ? open : internalOpen;
    const effectiveOnOpenChange = onOpenChange || setInternalOpen;

    return (
        <Dialog open={effectiveOpen} onOpenChange={handleOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormLayout
                            name="name"
                            label="Name"
                            children={(field) => (
                                <Input placeholder="e.g. Vermeer D24x40" {...field} />
                            )}
                        />

                        <FormLayout
                            name="type"
                            label="Type"
                            children={(field) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="RIG">Drill Rig</SelectItem>
                                        <SelectItem value="LOCATOR">Locator</SelectItem>
                                        <SelectItem value="EXCAVATOR">Excavator</SelectItem>
                                        <SelectItem value="TRUCK">Truck</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />

                        <FormLayout
                            name="model"
                            label="Model"
                            children={(field) => (
                                <Input placeholder="e.g. D24x40 S3" {...field} />
                            )}
                        />

                        <FormLayout
                            name="serialNumber"
                            label="Serial Number"
                            children={(field) => (
                                <Input placeholder="Serial #" {...field} />
                            )}
                        />

                        <FormLayout
                            name="status"
                            label="Status"
                            children={(field) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AVAILABLE">Available</SelectItem>
                                        <SelectItem value="IN_USE">In Use</SelectItem>
                                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                        <SelectItem value="RETIRED">Retired</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />

                        <FormLayout
                            name="location"
                            label="Home Yard / Assignment"
                            children={(field) => (
                                <Input placeholder="e.g. Main Yard" {...field} />
                            )}
                        />

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                                {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
