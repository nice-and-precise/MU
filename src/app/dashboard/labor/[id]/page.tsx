import { getEmployee, updateEmployee } from "@/actions/labor";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function EmployeeEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const employee = await getEmployee(id);

    if (!employee) {
        notFound();
    }

    async function update(formData: FormData) {
        "use server";
        const data = {
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            role: formData.get("role"),
            hourlyRate: Number(formData.get("hourlyRate")),
            email: formData.get("email"),
            phone: formData.get("phone"),
            address: formData.get("address"),
            ssn: formData.get("ssn"),
            // dob: formData.get("dob") ? new Date(formData.get("dob") as string) : null, // Handle date parsing if needed
            // hireDate: formData.get("hireDate") ? new Date(formData.get("hireDate") as string) : null,
        };

        await updateEmployee(id, data);
        redirect("/dashboard/labor");
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="mb-6">
                <Link href="/dashboard/labor" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Directory
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Edit Employee: {employee.firstName} {employee.lastName}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={update} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input id="firstName" name="firstName" defaultValue={employee.firstName} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input id="lastName" name="lastName" defaultValue={employee.lastName} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <select
                                    id="role"
                                    name="role"
                                    defaultValue={employee.role}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="Laborer">Laborer</option>
                                    <option value="Operator">Operator</option>
                                    <option value="Foreman">Foreman</option>
                                    <option value="Truck Driver">Truck Driver</option>
                                    <option value="Mechanic">Mechanic</option>
                                    <option value="Locator">Locator</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                                <Input id="hourlyRate" name="hourlyRate" type="number" step="0.01" defaultValue={employee.hourlyRate || ""} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" defaultValue={employee.email || ""} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" name="phone" type="tel" defaultValue={employee.phone || ""} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" name="address" defaultValue={employee.address || ""} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ssn">SSN (Last 4)</Label>
                            <Input id="ssn" name="ssn" defaultValue={employee.ssn || ""} />
                        </div>

                        <div className="pt-4">
                            <Button type="submit" className="w-full">
                                <Save className="w-4 h-4 mr-2" /> Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
