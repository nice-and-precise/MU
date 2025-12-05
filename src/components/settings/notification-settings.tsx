"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { updateUserPreferences } from "@/actions/user"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface NotificationSettingsProps {
    initialEnabled: boolean
}

export function NotificationSettings({ initialEnabled }: NotificationSettingsProps) {
    const [enabled, setEnabled] = React.useState(initialEnabled)
    const [loading, setLoading] = React.useState(false)

    const handleToggle = async (checked: boolean) => {
        setEnabled(checked) // Optimistic update
        setLoading(true)

        const res = await updateUserPreferences({ notifications: checked })
        setLoading(false)

        if (!res.success) {
            setEnabled(!checked) // Revert
            toast.error("Failed to update settings.")
        } else {
            toast.success(`Notifications ${checked ? 'enabled' : 'disabled'}.`)
        }
    }

    return (
        <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
                <label className="text-base font-medium">Notifications</label>
                <p className="text-sm text-muted-foreground">
                    Receive email alerts for daily reports
                </p>
            </div>
            <div className="flex items-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                <Switch
                    checked={enabled}
                    onCheckedChange={handleToggle}
                />
                <Badge variant={enabled ? "secondary" : "outline"} className={enabled ? "bg-green-100 text-green-800 hover:bg-green-100" : "text-slate-500"}>
                    {enabled ? "Enabled" : "Disabled"}
                </Badge>
            </div>
        </div>
    )
}
