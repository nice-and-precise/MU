import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { getStatusColor } from "@/lib/constants/status"
import { cn } from "@/lib/utils"

interface StatusBadgeProps extends React.ComponentProps<typeof Badge> {
    status: string
    label?: string
}

export function StatusBadge({ status, label, className, ...props }: StatusBadgeProps) {
    const colorClass = getStatusColor(status)

    return (
        <Badge
            variant="outline"
            className={cn("border-0 font-medium", colorClass, className)}
            {...props}
        >
            {label || status?.replace(/_/g, " ")}
        </Badge>
    )
}
