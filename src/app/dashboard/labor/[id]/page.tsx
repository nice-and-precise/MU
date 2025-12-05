import { getEmployee, getEmployeeUsage, getEmployeeTimeEntries } from "@/actions/employees";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Phone, Mail, MapPin, Calendar, HardHat, FileText, Activity, Clock } from "lucide-react";
import { format } from "date-fns";

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [employeeRes, usageRes, timeRes] = await Promise.all([
        getEmployee(id),
        getEmployeeUsage(id),
        getEmployeeTimeEntries(id)
    ]);

    if (!employeeRes.success || !employeeRes.data) {
        return <div className="p-8">Employee not found</div>;
    }

    const employee = employeeRes.data;
    const usage = usageRes.success ? usageRes.data : [];
    const timeEntries = timeRes.success ? timeRes.data : [];

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header / Profile Card */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="h-32 w-32 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-4 border-white dark:border-slate-700 shadow-md shrink-0">
                    {employee.photoUrl ? (
                        <img src={employee.photoUrl} alt="Profile" className="h-full w-full object-cover" />
                    ) : employee.user?.avatar ? (
                        <img src={employee.user.avatar} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                        <div className="text-slate-400">
                            {employee.role === 'Foreman' ? <HardHat className="w-16 h-16" /> : <User className="w-16 h-16" />}
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">{employee.firstName} {employee.lastName}</h1>
                        <Badge className={`text-base px-3 py-1 ${employee.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {employee.status}
                        </Badge>
                    </div>
                    <p className="text-xl text-muted-foreground flex items-center gap-2">
                        {employee.role}
                        {employee.position && <span className="text-sm bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">{employee.position}</span>}
                    </p>

                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600 dark:text-slate-400">
                        {employee.phone && (
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span>{employee.phone}</span>
                            </div>
                        )}
                        {employee.email && (
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <span>{employee.email}</span>
                            </div>
                        )}
                        {employee.address && (
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{employee.address}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Hired: {employee.hireDate ? format(new Date(employee.hireDate), 'MMM d, yyyy') : 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="history">History & Usage</TabsTrigger>
                    <TabsTrigger value="certs">Certifications</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Employment Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Pay Type</p>
                                        <p className="font-medium capitalize">{employee.payType?.toLowerCase()}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Hourly Rate</p>
                                        <p className="font-medium">${employee.hourlyRate}/hr</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Employee ID</p>
                                        <p className="font-medium font-mono">{employee.id.slice(-6).toUpperCase()}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Tax Status</p>
                                        <p className="font-medium">{employee.taxStatus || 'N/A'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Emergency Contact</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {employee.emergencyContact ? (
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-100 dark:border-red-900 text-sm">
                                        <p className="font-medium text-red-900 dark:text-red-200">{employee.emergencyContact}</p>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-sm">No emergency contact on file.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="history" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Equipment Usage History</CardTitle>
                            <CardDescription>Log of equipment operated by {employee.firstName}.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900 text-muted-foreground border-b">
                                        <tr>
                                            <th className="p-3 font-medium">Date</th>
                                            <th className="p-3 font-medium">Asset</th>
                                            <th className="p-3 font-medium">Project</th>
                                            <th className="p-3 font-medium text-right">Hours</th>
                                            <th className="p-3 font-medium">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {usage && usage.length > 0 ? (
                                            usage.map((log: any) => (
                                                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                                    <td className="p-3">{format(new Date(log.date), 'MMM d, yyyy')}</td>
                                                    <td className="p-3 font-medium">{log.asset?.name || 'Unknown Asset'}</td>
                                                    <td className="p-3 text-blue-600">{log.project?.name || 'Unknown Project'}</td>
                                                    <td className="p-3 text-right font-mono">{log.hours}</td>
                                                    <td className="p-3 text-muted-foreground max-w-xs truncate">{log.notes || '-'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                                    No equipment usage logged.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Time Entry History</CardTitle>
                            <CardDescription>Log of hours worked.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900 text-muted-foreground border-b">
                                        <tr>
                                            <th className="p-3 font-medium">Date</th>
                                            <th className="p-3 font-medium">Phase/Code</th>
                                            <th className="p-3 font-medium">Crew</th>
                                            <th className="p-3 font-medium text-right">Hours</th>
                                            <th className="p-3 font-medium">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {timeEntries && timeEntries.length > 0 ? (
                                            timeEntries.map((entry: any) => (
                                                <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                                    <td className="p-3">{format(new Date(entry.date), 'MMM d, yyyy')}</td>
                                                    <td className="p-3 font-medium">
                                                        <div className="flex flex-col">
                                                            <span>{entry.phase?.name || 'General'}</span>
                                                            <span className="text-xs text-muted-foreground">{entry.phase?.code}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">{entry.timeCard?.crew?.name || '-'}</td>
                                                    <td className="p-3 text-right font-mono">{entry.hours}</td>
                                                    <td className="p-3 text-muted-foreground max-w-xs truncate">{entry.description || '-'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                                    No time entries found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="certs" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Certifications & Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {employee.certs && employee.certs.length > 0 ? (
                                    employee.certs.map((cert: any) => (
                                        <div key={cert.id} className="p-4 border rounded-lg flex items-start gap-3 bg-slate-50 dark:bg-slate-900/50">
                                            <FileText className="w-5 h-5 text-blue-600 mt-1" />
                                            <div>
                                                <p className="font-bold text-sm">{cert.name}</p>
                                                <p className="text-xs text-muted-foreground">{cert.provider}</p>
                                                {cert.expiresDate && (
                                                    <p className={`text-xs mt-2 font-medium ${new Date(cert.expiresDate) < new Date() ? 'text-red-600' : 'text-green-600'}`}>
                                                        Expires: {format(new Date(cert.expiresDate), 'MM/dd/yy')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground col-span-full">No certifications found.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
