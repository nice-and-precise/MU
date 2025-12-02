import { getPunchList, getProjectPhotos } from "@/actions/qc";
import { prisma } from "@/lib/prisma"; // Direct access for users list
import PunchList from "@/components/qc/PunchList";
import PhotoGallery from "@/components/qc/PhotoGallery";

export default async function QCPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const projectId = id;
    const [punchItems, photos, users] = await Promise.all([
        getPunchList(projectId),
        getProjectPhotos(projectId),
        prisma.user.findMany({ orderBy: { name: 'asc' } })
    ]);

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quality Control</h1>
                <p className="text-gray-500">Punch list and project documentation.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <PunchList projectId={projectId} items={punchItems} users={users} />
                </div>
                <div className="lg:col-span-2">
                    <PhotoGallery photos={photos} />
                </div>
            </div>
        </div>
    );
}
