"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function DailyReportForm({ projects }: { projects: any[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        projectId: "",
        reportDate: new Date().toISOString().split("T")[0],
        notes: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { createDailyReport } = await import("@/app/actions/reports");
            await createDailyReport(formData);
            router.push("/dashboard/reports");
            router.refresh();
        } catch (error: any) {
            console.error("Error submitting report:", error);
            alert(error.message || "Failed to create report");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-xl shadow-sm border border-border">
            <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Select
                    value={formData.projectId}
                    onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                >
                    <SelectTrigger id="project">
                        <SelectValue placeholder="Select a project..." />
                    </SelectTrigger>
                    <SelectContent>
                        {projects.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                                {p.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                    id="date"
                    type="date"
                    required
                    value={formData.reportDate}
                    onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                    id="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
            </div>

            <Button
                type="submit"
                disabled={loading}
                variant="secondary"
                className="w-full font-bold"
            >
                {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
                {loading ? "Creating..." : "Create Report"}
            </Button>
        </form>
    );
}
