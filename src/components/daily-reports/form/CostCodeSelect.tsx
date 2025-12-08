'use client';

import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCostItems } from '@/actions/cost-codes';
import { toast } from 'sonner';

interface CostItem {
    id: string;
    code: string;
    description: string | null;
    category: { name: string };
}

interface CostCodeSelectProps {
    value?: string;
    onChange: (value: string, code?: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function CostCodeSelect({ value, onChange, placeholder = "Select Cost Code", disabled }: CostCodeSelectProps) {
    const [items, setItems] = useState<CostItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await getCostItems();
                if (res.success && res.data) {
                    setItems(res.data);
                } else {
                    toast.error("Failed to load cost codes");
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, []);

    return (
        <Select
            value={value}
            onValueChange={(val) => {
                const item = items.find(i => i.id === val);
                onChange(val, item?.code);
            }}
            disabled={disabled || loading}
        >
            <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading..." : placeholder} />
            </SelectTrigger>
            <SelectContent>
                {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                        <span className="font-mono font-bold mr-2">{item.code}</span>
                        <span className="text-muted-foreground">{item.description}</span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
