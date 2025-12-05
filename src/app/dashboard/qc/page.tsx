import { getPunchList, getProjectPhotos } from "@/actions/qc";
import { getActiveProjects } from "@/actions/projects";
import PunchList from "@/components/qc/PunchList";
import PhotoGallery from "@/components/qc/PhotoGallery";
import { prisma } from "@/lib/prisma";

export default async function QCDashboard() {
    // Fetch data
    const [{ data: projects }, users] = await Promise.all([
        getActiveProjects(),
        prisma.user.findMany({ orderBy: { name: 'asc' } })
    ]);

    // For now, default to the first active project or empty string
    // In the future, this should be driven by a query param or context
    const currentProjectId = projects?.[0]?.id || "";

    // Fetch QC data only if we have a project
    let punchItems: any[] = [];
    let photos: any[] = [];

    if (currentProjectId) {
        const [punchItemsRes, photosRes] = await Promise.all([
            getPunchList(currentProjectId),
            getProjectPhotos(currentProjectId)
        ]);
        punchItems = punchItemsRes.data || [];
        photos = photosRes.data || [];
    }

    return (
        <div className="container mx-auto p-6 md:p-8 space-y-8 max-w-7xl">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl font-bold font-heading text-primary tracking-tight">
                    Quality Control
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    Manage punch lists, inspections, and project photos.
                </p>
            </div>

            <hr className="my-6 border-border" />

            {!currentProjectId ? (
                <div className="p-12 text-center border-2 border-dashed rounded-xl bg-muted/20">
                    <p className="text-muted-foreground">No active projects found. Please create a project to start tracking QC.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold tracking-tight">Punch List</h2>
                            {/* Potential future project selector here */}
                            <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                                {projects?.[0]?.name}
                            </span>
                        </div>
                        <PunchList
                            projectId={currentProjectId}
                            items={punchItems}
                            users={users}
                        />
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold tracking-tight">Photo Gallery</h2>
                        <PhotoGallery
                            projectId={currentProjectId}
                            photos={photos}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
