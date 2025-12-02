import { OwnerCommandCenter } from "@/components/admin/OwnerCommandCenter";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
    const session = await getServerSession(authOptions);

    // Strict RBAC: Only OWNER can access this page
    if (session?.user?.role !== "OWNER") {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <OwnerCommandCenter />
        </div>
    );
}
