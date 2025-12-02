"use client";

import dynamic from 'next/dynamic';

const ProductionChart = dynamic(() => import("./ProductionChart").then(mod => mod.ProductionChart), {
    loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-lg" />,
    ssr: false
});

export default function ProductionChartWrapper(props: any) {
    return <ProductionChart {...props} />;
}
