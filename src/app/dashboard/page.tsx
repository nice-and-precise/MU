import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/");
    }

    const role = session.user.role;

    if (role === "OWNER") {
        redirect("/dashboard/owner");
    } else if (role === "SUPER") {
        redirect("/dashboard/super");
    } else {
        redirect("/dashboard/crew");
    }
}
