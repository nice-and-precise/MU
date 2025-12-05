import { getPunchList, getProjectPhotos } from "@/actions/qc";
import { prisma } from "@/lib/prisma";
import PunchList from "@/components/qc/PunchList";
import PhotoGallery from "@/components/qc/PhotoGallery";

export default async function QCPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const [punchItemsRes, photosRes, users] = await Promise.all([
        getPunchList(id),
        getProjectPhotos(id),
        prisma.user.findMany({ orderBy: { name: 'asc' } })
    ]);

    const punchItems = punchItemsRes.data || [];
    const photos = photosRes.data || [];

    return (
        <div className="container mx-auto p-6 md:p-8 space-y-8 max-w-7xl">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl font-bold font-heading text-primary tracking-tight">
                    Quality Control
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    Manage punch list items, track issues, and document project progress with photos.
                </p>
            </div>

            <hr className="my-6 border-border" />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-1 order-2 xl:order-1 h-full">
                    <PunchList projectId={id} items={punchItems} users={users} />
                </div>
                <div className="xl:col-span-2 order-1 xl:order-2 h-full">
                    <PhotoGallery photos={photos} projectId={id} />
                </div>
            </div>
        </div>
    );
}
