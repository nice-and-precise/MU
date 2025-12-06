"use client";

import Link from "next/link";
import {
    PenTool,
    FileText,
    ClipboardCheck,
    AlertTriangle,
    Users,
    TrendingUp,
    PlusCircle
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface QuickActionProps {
    role: string;
}

export function QuickActions({ role }: QuickActionProps) {
    const isCrew = role === "FOREMAN" || role === "OPERATOR" || role === "LABORER" || role === "CREW";
    const isOwner = role === "OWNER" || role === "SUPER";

    if (isCrew) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <QuickActionCard
                    href="/dashboard/rod-pass"
                    icon={PenTool}
                    title="Log Rod"
                    color="text-blue-500"
                    bgColor="bg-blue-50 dark:bg-blue-900/20"
                />
                <QuickActionCard
                    href="/dashboard/reports/new"
                    icon={FileText}
                    title="Daily Report"
                    color="text-green-500"
                    bgColor="bg-green-50 dark:bg-green-900/20"
                />
                <QuickActionCard
                    href="/dashboard/qc"
                    icon={PlusCircle}
                    title="Punch Item"
                    color="text-orange-500"
                    bgColor="bg-orange-50 dark:bg-orange-900/20"
                />
                <QuickActionCard
                    href="/dashboard/tickets"
                    icon={ClipboardCheck}
                    title="View Tickets"
                    color="text-purple-500"
                    bgColor="bg-purple-50 dark:bg-purple-900/20"
                />
            </div>
        );
    }

    if (isOwner) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <QuickActionCard
                    href="/dashboard/projects?filter=overbudget"
                    icon={TrendingUp}
                    title="Over Budget"
                    color="text-red-500"
                    bgColor="bg-red-50 dark:bg-red-900/20"
                />
                <QuickActionCard
                    href="/dashboard/crew"
                    icon={Users}
                    title="Active Crews"
                    color="text-blue-500"
                    bgColor="bg-blue-50 dark:bg-blue-900/20"
                />
                <QuickActionCard
                    href="/dashboard/safety"
                    icon={AlertTriangle}
                    title="Incidents"
                    color="text-yellow-500"
                    bgColor="bg-yellow-50 dark:bg-yellow-900/20"
                />
                <QuickActionCard
                    href="/dashboard/reports"
                    icon={FileText}
                    title="Daily Reports"
                    color="text-gray-500"
                    bgColor="bg-gray-50 dark:bg-gray-900/20"
                />
            </div>
        );
    }

    return null;
}

function QuickActionCard({ href, icon: Icon, title, color, bgColor }: any) {
    return (
        <Link href={href} className="group">
            <Card className={`p-4 flex flex-col items-center justify-center text-center h-28 transition-all hover:scale-105 hover:shadow-md border-2 border-transparent hover:border-blue-500/20 ${bgColor}`}>
                <Icon className={`h-8 w-8 mb-2 ${color}`} />
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</span>
            </Card>
        </Link>
    );
}
