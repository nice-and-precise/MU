import { prisma } from '@/lib/prisma';
import { CreateEmployeeInput, UpdateEmployeeInput } from '@/schemas/employees';

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
        return await prisma.employee.create({
            data: {
                ...data,
                // Ensure dates are Date objects if not transformed by Zod (double check)
                // Zod transform handles it, but Prisma expects Date or string (ISO).
                // If Zod returns Date, we are good.
            }
        });
    }

    static async updateEmployee(id: string, data: UpdateEmployeeInput) {
        return await prisma.employee.update({
            where: { id },
            data,
        });
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
}
