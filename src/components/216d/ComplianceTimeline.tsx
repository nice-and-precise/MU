import { format } from "date-fns";
import { CheckCircle, AlertTriangle, FileText, Camera, Users } from "lucide-react";

interface ComplianceEvent {
    id: string;
    eventType: string;
    timestamp: string | Date;
    details: string | null;
    createdById: string | null;
}

interface ComplianceTimelineProps {
    events: ComplianceEvent[];
}

export function ComplianceTimeline({ events }: ComplianceTimelineProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case "TICKET_FILED": return <FileText className="h-5 w-5 text-blue-500" />;
            case "WHITE_LINING_CAPTURED": return <Camera className="h-5 w-5 text-emerald-500" />;
            case "MEET_SCHEDULED": return <Users className="h-5 w-5 text-purple-500" />;
            case "REMARK_REQUESTED": return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            case "DAMAGE_REPORTED": return <AlertTriangle className="h-5 w-5 text-red-500" />;
            default: return <CheckCircle className="h-5 w-5 text-gray-500" />;
        }
    };

    const getLabel = (type: string) => {
        return type.replace(/_/g, " ");
    };

    return (
        <div className="flow-root">
            <ul role="list" className="-mb-8">
                {events.map((event, eventIdx) => (
                    <li key={event.id}>
                        <div className="relative pb-8">
                            {eventIdx !== events.length - 1 ? (
                                <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white ring-1 ring-gray-200">
                                    {getIcon(event.eventType)}
                                </div>
                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            {getLabel(event.eventType)} <span className="font-medium text-gray-900">{event.details}</span>
                                        </p>
                                    </div>
                                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                        <time dateTime={new Date(event.timestamp).toISOString()}>
                                            {format(new Date(event.timestamp), "MMM d, h:mm a")}
                                        </time>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
                {events.length === 0 && (
                    <p className="text-gray-500 text-sm">No compliance events recorded yet.</p>
                )}
            </ul>
        </div>
    );
}
