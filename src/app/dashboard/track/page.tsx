import { LiveFleetMap } from "@/components/tracking/LiveFleetMap";

export default function TrackingPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-charcoal">Live Fleet Tracking</h1>
                    <p className="text-muted-foreground">Real-time GPS location and status of all assets.</p>
                </div>
            </div>

            <LiveFleetMap />
        </div>
    );
}
