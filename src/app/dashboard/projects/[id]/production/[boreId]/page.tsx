import { getBoreDetails } from "@/actions/drilling";
import { notFound } from "next/navigation";
import RodLogger from "@/components/drilling/RodLogger";
import AsBuiltProfile from "@/components/drilling/AsBuiltProfile";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function RodLoggerPage({ params }: { params: Promise<{ id: string; boreId: string }> }) {
    const { id, boreId } = await params;
    const bore = await getBoreDetails(boreId);

    if (!bore) {
        notFound();
    }

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen space-y-6">
            <div className="max-w-md mx-auto">
                <Link href={`/dashboard/projects/${id}/production`} className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-4">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Bores
                </Link>
                <h1 className="text-2xl font-bold">{bore.name}</h1>
                <p className="text-gray-500 text-sm">Logging Active</p>
            </div>

            <RodLogger bore={bore} />

            <div className="max-w-md mx-auto">
                <AsBuiltProfile rodPasses={bore.rodPasses} boreName={bore.name} />
            </div>
        </div>
    );
}
