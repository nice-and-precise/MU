import { getPunchList, getProjectPhotos } from "@/actions/qc";
import { getActiveProjects } from "@/actions/projects";
import PunchList from "@/components/qc/PunchList";
import PhotoGallery from "@/components/qc/PhotoGallery";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function QCDashboard() {
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role || "CREW";

    // Fetch data
    const { data: projects } = await getActiveProjects();

    // For now, just pick the first project or all items
    // In a real app, this would be filtered by the selected project
    const currentProjectId = projects?.[0]?.id || "";
    // For dashboard, maybe we want all projects? Refactored action takes projectId.
    // If we pass undefined/null it might fail validation if schema requires string.
    // Schema: z.string().
    // We need to fetch for all projects or iterating?
    // Original code: getPunchList(currentProjectId)
    // We need currentProjectId from somewhere.

    // Check line 18 in original file from context?
    // "const punchItems = await getPunchList(currentProjectId);"

    // I will assume the page logic defines currentProjectId and just wrap the result.
    const [punchItemsRes, photosRes] = await Promise.all([
        getPunchList(currentProjectId),
        getProjectPhotos(currentProjectId)
    ]);

    const punchItems = punchItemsRes.data || [];
    const photos = photosRes.data || [];

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#003366]">Quality Control</h1>
                    <p className="text-muted-foreground">Manage punch lists, inspections, and project photos.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Punch List</h2>
                    <PunchList
                        projectId={currentProjectId}
                        items={punchItems || []}
                        users={[]} // TODO: Fetch users if needed for assignment dropdown
                    />
                </div>
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Photo Gallery</h2>
                    <PhotoGallery
                        projectId={currentProjectId}
                        photos={photos || []}
                    />
                </div>
            </div>
        </div>
    );
}
