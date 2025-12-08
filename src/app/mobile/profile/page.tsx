import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignDocumentButton } from "@/components/mobile/SignDocumentButton";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);
    const employee = session?.user?.email
        ? await prisma.employee.findFirst({ where: { email: session.user.email } })
        : null;

    // Fetch related data
    const [docs, certs] = employee ? await Promise.all([
        prisma.staffDocument.findMany({
            where: { employeeId: employee.id, status: 'PENDING' },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.certification.findMany({
            where: { employeeId: employee.id, status: 'ACTIVE' },
            orderBy: { expiresDate: 'asc' }
        })
    ]) : [[], []];

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border">
                <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-600">
                    {employee?.firstName?.[0] || "U"}
                </div>
                <div>
                    <h2 className="text-lg font-heading uppercase tracking-tight">{employee ? `${employee.firstName} ${employee.lastName}` : session?.user?.name}</h2>
                    <p className="text-sm text-gray-500">{employee?.position || "Staff"}</p>
                    <p className="text-xs text-gray-400">{session?.user?.email}</p>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="font-heading uppercase tracking-tight text-sm text-gray-600">Pending Documents</h3>
                {docs.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border p-3 text-sm text-gray-500">
                        No pending documents to sign.
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border divide-y">
                        {docs.map(doc => (
                            <div key={doc.id} className="p-3 flex justify-between items-center">
                                <span className="text-sm font-medium">{doc.name}</span>
                                <SignDocumentButton id={doc.id} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <h3 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">Active Certifications</h3>
                {certs.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border p-3 text-sm text-gray-500">
                        No active certifications.
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border divide-y">
                        {certs.map(cert => (
                            <div key={cert.id} className="p-3">
                                <div className="flex justify-between">
                                    <span className="font-medium text-sm">{cert.name}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${cert.expiresDate && new Date(cert.expiresDate) < new Date() ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                        {cert.expiresDate ? new Date(cert.expiresDate).toLocaleDateString() : 'No Expiry'}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{cert.provider}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <form action="/api/auth/signout" method="POST">
                <Button variant="destructive" size="mobile" className="w-full flex items-center gap-2 justify-center">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </Button>
            </form>
        </div>
    );
}
