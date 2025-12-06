import { prisma } from '@/lib/prisma';
import { CreateEmployeeInput, UpdateEmployeeInput } from '@/schemas/employees';
import bcrypt from 'bcryptjs';

export class EmployeeService {
    static async getEmployees() {
        return await prisma.employee.findMany({
            include: {
                user: true,
                crews: {
                    include: {
                        crew: true
                    }
                },
                foremanCrews: true,
                certs: true,
            },
            orderBy: { lastName: 'asc' }
        });
    }

    static async getEmployee(id: string) {
        return await prisma.employee.findUnique({
            where: { id },
            include: {
                user: true,
                crews: {
                    include: {
                        crew: true
                    }
                },
                certs: true,
                incidents: true,
                documents: true,
                statusHistory: {
                    orderBy: { effectiveDate: 'desc' }
                }
            }
        });
    }

    static async createEmployee(data: CreateEmployeeInput) {
        const employee = await prisma.employee.create({
            data: {
                ...data,
            }
        });

        // Create initial status history
        await prisma.employmentStatusHistory.create({
            data: {
                employeeId: employee.id,
                status: employee.status,
                reason: "Initial Hire",
                effectiveDate: new Date(),
                createdBy: "System"
            }
        });

        return employee;
    }

    static async updateEmployee(id: string, data: UpdateEmployeeInput) {
        const current = await prisma.employee.findUnique({ where: { id } });

        const result = await prisma.employee.update({
            where: { id },
            data,
        });

        // If status changed, record history
        if (current && data.status && data.status !== current.status) {
            await prisma.employmentStatusHistory.create({
                data: {
                    employeeId: id,
                    status: data.status,
                    reason: "Status Change",
                    effectiveDate: new Date(),
                    createdBy: "System"
                }
            });
        }

        return result;
    }

    static async deleteEmployee(id: string) {
        return await prisma.employee.delete({
            where: { id }
        });
    }

    static async getAvailableCrewMembers() {
        return await prisma.employee.findMany({
            where: { status: "ACTIVE" },
            orderBy: { lastName: 'asc' }
        });
    }

    static async getEmployeeUsage(id: string) {
        return await prisma.equipmentUsage.findMany({
            where: { employeeId: id },
            include: {
                asset: true,
                project: true
            },
            orderBy: { date: 'desc' }
        });
    }

    static async getEmployeeTimeEntries(id: string) {
        return await prisma.timeEntry.findMany({
            where: { employeeId: id },
            include: {
                project: true
            },
            orderBy: { startTime: 'desc' }
        });
    }

    static async createSystemUser(employeeId: string, email: string, role: string) {
        const hashedPassword = await bcrypt.hash("Welcome123!", 10);

        // Check if user already exists with this email
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            // Check if already linked
            const emp = await prisma.employee.findUnique({ where: { id: employeeId } });
            if (emp?.userId === existingUser.id) {
                return existingUser;
            }
            throw new Error("User with this email already exists but is not linked to this employee.");
        }

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: role || 'CREW',
                name: email.split('@')[0], // Placeholder name
                employee: {
                    connect: { id: employeeId }
                }
            }
        });

        // Update employee with userId just in case (though connect should handle it if relation is set up right)
        // Prisma schema: Employee.userId points to User.id. Relation on Employee side.
        // Wait, schema says:
        // Employee { userId @unique, user @relation(fields: [userId], references: [id]) }
        // User { employee Employee? }
        // So we need to update Employee.userId.

        await prisma.employee.update({
            where: { id: employeeId },
            data: { userId: user.id }
        });

        return user;
    }

    static async signDocument(id: string) {
        return await prisma.staffDocument.update({
            where: { id },
            data: {
                status: 'SIGNED',
                signedAt: new Date()
            }
        });
    }
}

