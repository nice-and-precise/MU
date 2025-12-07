import * as React from "react"
import { useFormContext } from "react-hook-form"
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils"

interface FormLayoutProps {
    name: string
    label?: string
    description?: string
    required?: boolean
    children: (field: any) => React.ReactNode
    className?: string
}

export function FormLayout({
    name,
    label,
    description,
    required,
    children,
    className,
}: FormLayoutProps) {
    const { control } = useFormContext()

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    {label && (
                        <FormLabel>
                            {label}
                            {required && <span className="text-destructive ml-1">*</span>}
                        </FormLabel>
                    )}
                    <FormControl>
                        {children(field)}
                    </FormControl>
                    {description && <p className="text-xs text-muted-foreground">{description}</p>}
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
