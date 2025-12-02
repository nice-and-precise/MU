"use client";

import dynamic from 'next/dynamic';

const LiveTelemetry = dynamic(() => import("./LiveTelemetry").then(mod => mod.LiveTelemetry), {
    loading: () => <div className="h-screen w-full bg-gray-100 animate-pulse rounded-lg" />,
    ssr: false
});

export default function LiveTelemetryWrapper(props: any) {
    return <LiveTelemetry {...props} />;
}
