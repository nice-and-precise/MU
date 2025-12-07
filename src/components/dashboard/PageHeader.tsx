"use client"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
    title: string
    breadcrumbs?: {
        title: string
        href?: string
    }[]
    status?: React.ReactNode
    actions?: React.ReactNode
    className?: string
}

export function PageHeader({ title, breadcrumbs, status, actions, className }: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col gap-4 mb-6", className)}>
            {breadcrumbs && breadcrumbs.length > 0 && (
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbs.map((crumb, i) => {
                            const isLast = i === breadcrumbs.length - 1
                            return (
                                <BreadcrumbItem key={i}>
                                    {isLast || !crumb.href ? (
                                        <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink href={crumb.href}>{crumb.title}</BreadcrumbLink>
                                    )}
                                    {!isLast && <BreadcrumbSeparator />}
                                </BreadcrumbItem>
                            )
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
            )}

            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                            {title}
                        </h1>
                        {status}
                    </div>
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
        </div>
    )
}
