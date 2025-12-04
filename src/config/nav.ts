import {
    LayoutDashboard,
    HardHat,
    Globe,
    MapPin,
    Flag,
    FileText,
    Activity,
    ClipboardCheck,
    Users,
    Package,
    Calculator,
    Settings
} from "lucide-react";

export interface NavItem {
    title: string;
    href: string;
    icon: any;
    roles?: string[]; // Optional: restrict to specific roles
}

export interface NavGroup {
    title: string;
    items: NavItem[];
    roles?: string[]; // Optional: restrict group to specific roles
}

export const NAV_ITEMS: NavGroup[] = [
    {
        title: "Operations",
        items: [
            { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { title: "Projects", href: "/dashboard/projects", icon: HardHat },
            { title: "3D Maps", href: "/dashboard/map", icon: Globe },
            { title: "Live Tracking", href: "/dashboard/track", icon: MapPin },
            { title: "811 Tickets", href: "/811", icon: Flag },
        ]
    },
    {
        title: "Field Reporting",
        items: [
            { title: "Daily Reports", href: "/dashboard/reports", icon: FileText },
            { title: "Drilling Ops", href: "/dashboard/drilling", icon: Activity },
            { title: "Log Rod Pass", href: "/dashboard/rod-pass", icon: Activity },
            { title: "Quality Control", href: "/dashboard/qc", icon: ClipboardCheck },
        ]
    },
    {
        title: "Resources",
        items: [
            { title: "Dispatch", href: "/dashboard/crew", icon: Users },
            { title: "Labor", href: "/dashboard/labor", icon: Users },
            { title: "Inventory", href: "/dashboard/inventory", icon: Package },
            { title: "Assets", href: "/dashboard/assets", icon: Package },
        ]
    },
    {
        title: "Administration",
        items: [
            { title: "Estimating", href: "/dashboard/estimating", icon: Calculator },
            { title: "Command Center", href: "/dashboard/admin", icon: LayoutDashboard, roles: ["OWNER"] },
            { title: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["OWNER"] },
        ]
    }
];
