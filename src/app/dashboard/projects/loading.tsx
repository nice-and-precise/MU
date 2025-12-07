import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-[#003366] uppercase tracking-tight">Projects</h1>
                    <p className="text-gray-500 mt-1">Manage and track all active jobs</p>
                </div>
                <div className="bg-[#003366] text-white px-6 py-3 rounded font-bold shadow-sm opacity-50 cursor-wait">
                    + New Project
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                        key={i}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-[200px]"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-6 w-16" />
                        </div>
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-6" />

                        <div className="space-y-3 pt-4 border-t border-gray-100">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
