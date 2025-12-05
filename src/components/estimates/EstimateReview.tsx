"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Save } from "lucide-react";
import { createEstimateFromItems } from "@/actions/estimating";
import { toast } from "sonner";

interface EstimateItem {
    id: string;
    description: string;
    quantity: number;
    unit: string;
    unitCost: number;
    total: number;
}

export function EstimateReview({ initialData }: { initialData: EstimateItem[] }) {
    const [items, setItems] = useState<EstimateItem[]>(initialData);

    const handleChange = (id: string, field: keyof EstimateItem, value: string | number) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    const updated = { ...item, [field]: value };
                    if (field === "quantity" || field === "unitCost") {
                        updated.total = Number(updated.quantity) * Number(updated.unitCost);
                    }
                    return updated;
                }
                return item;
            })
        );
    };

    const handleDelete = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const handleSave = async () => {
        try {
            const name = prompt("Enter a name for this estimate:", "Imported Estimate");
            if (!name) return;

            toast.loading("Saving estimate...");
            const result = await createEstimateFromItems({
                name,
                items: items.map(item => ({
                    description: item.description,
                    quantity: item.quantity,
                    unit: item.unit,
                    unitCost: item.unitCost,
                    markup: 0, // Default
                    laborCost: 0,
                    equipmentCost: 0,
                    materialCost: 0
                }))
            });

            if (result.success) {
                toast.dismiss();
                toast.success("Estimate saved successfully!");
                // Optional: Redirect to the new estimate
                // window.location.href = `/dashboard/estimating/${result.data.id}`;
            } else {
                toast.dismiss();
                toast.error("Failed to save estimate: " + result.error);
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Review Extracted Data</h2>
                <Button onClick={handleSave} className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Estimate
                </Button>
            </div>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40%]">Description</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Unit Cost</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <Input
                                        value={item.description}
                                        onChange={(e) => handleChange(item.id, "description", e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => handleChange(item.id, "quantity", Number(e.target.value))}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        value={item.unit}
                                        onChange={(e) => handleChange(item.id, "unit", e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        value={item.unitCost}
                                        onChange={(e) => handleChange(item.id, "unitCost", Number(e.target.value))}
                                    />
                                </TableCell>
                                <TableCell>${item.total.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-700"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
