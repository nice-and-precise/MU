
import { FieldDashboard } from "@/components/field/FieldDashboard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { getAvailableCrewMembers } from "@/actions/employees";
import { getAssets } from "@/actions/assets";
import { getActiveProjects } from "@/actions/projects";
import { getTickets } from "@/actions/tickets";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function CrewDashboard() {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user?.role as "Foreman" | "Operator" | "Laborer") || "Laborer";

    // Fetch data
    const { data: employees } = await getAvailableCrewMembers();
    const res = await getAssets();
    const assets = res.success && res.data ? res.data : [];
    const { data: projects } = await getActiveProjects();

    // Assuming the crew is assigned to a specific project, or we pick the first active one for now
    // In a real app, we'd get the user's assigned project.
    const currentProject = projects?.[0] || {
        id: "demo-project",
        name: "Demo Project",
        location: "123 Main St",
        latitude: 45.118,
        longitude: -95.042
    };

    // Fetch active ticket for the project
    const { data: tickets } = await getTickets({ projectId: currentProject.id, status: 'ACTIVE' });
    const activeTicketId = tickets?.[0]?.id;

    return (
        <div className="p-4 md:p-8">
            <QuickActions role={userRole} />
            <FieldDashboard
                userRole={userRole}
                projectId={currentProject.id}
                projectName={currentProject.name}
                projectAddress={currentProject.location || "Unknown Location"}
                projectLat={currentProject.latitude || 0}
                projectLong={currentProject.longitude || 0}
                currentUserId={session?.user?.id || ""}
                employees={employees || []}
                assets={assets || []}
                projects={projects || []}
                activeTicketId={activeTicketId}
            />
        </div>
    );
}
