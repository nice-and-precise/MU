'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createAsset, updateAsset } from '@/actions/assets';
import { Asset } from '@prisma/client';

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

    const [formData, setFormData] = useState({
        name: asset?.name || '',
        type: asset?.type || 'RIG',
        model: asset?.model || '',
        serialNumber: asset?.serialNumber || '',
        status: asset?.status || 'AVAILABLE',
        location: asset?.location || '',
    });

    const handleOpenChange = (newOpen: boolean) => {
        setInternalOpen(newOpen);
        onOpenChange?.(newOpen);
        if (!newOpen && !isEdit) {
            // Reset form on close if creating
            setFormData({
                name: '',
                type: 'RIG',
                model: '',
                serialNumber: '',
                status: 'AVAILABLE',
                location: '',
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEdit && asset) {
                await updateAsset(asset.id, formData);
            } else {
                await createAsset(formData);
            }
            handleOpenChange(false);
        } catch (error) {
            console.error('Failed to save asset', error);
        } finally {
            setLoading(false);
        }
    };

    const effectiveOpen = open !== undefined ? open : internalOpen;
    const effectiveOnOpenChange = onOpenChange || setInternalOpen;

    return (
        <Dialog open={effectiveOpen} onOpenChange={effectiveOnOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Vermeer D24x40"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="type">Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) => setFormData({ ...formData, type: value })}
                        >
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
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="model">Model</Label>
                        <Input
                            id="model"
                            value={formData.model}
                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                            placeholder="e.g. D24x40 S3"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="serialNumber">Serial Number</Label>
                        <Input
                            id="serialNumber"
                            value={formData.serialNumber}
                            onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                            placeholder="Serial #"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData({ ...formData, status: value })}
                        >
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
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="location">Location (Yard/General)</Label>
                        <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="e.g. Main Yard"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
