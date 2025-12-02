'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"

export async function getEmployees() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        user: true,
        crews: {
          include: {
            crew: true
          }
        },
        foremanCrews: true,
      },
      orderBy: { lastName: 'asc' }
    })
    return { success: true, data: employees }
  } catch (error) {
    console.error("Failed to fetch employees:", error)
    return { success: false, error: "Failed to fetch employees" }
  }
}

export async function getEmployee(id: string) {
  try {
    const employee = await prisma.employee.findUnique({
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
    })
    return { success: true, data: employee }
  } catch (error) {
    console.error("Failed to fetch employee:", error)
    return { success: false, error: "Failed to fetch employee" }
  }
}

export async function updateEmployee(id: string, data: Prisma.EmployeeUpdateInput) {
  try {
    const employee = await prisma.employee.update({
      where: { id },
      data,
    })
    revalidatePath('/dashboard/staff')
    return { success: true, data: employee }
  } catch (error) {
    console.error("Failed to update employee:", error)
    return { success: false, error: "Failed to update employee" }
  }
}

export async function createEmployee(data: Prisma.EmployeeCreateInput) {
  try {
    const employee = await prisma.employee.create({
      data,
    })
    revalidatePath('/dashboard/staff')
    return { success: true, data: employee }
  } catch (error) {
    console.error("Failed to create employee:", error)
    return { success: false, error: "Failed to create employee" }
  }
}

export async function getAvailableCrewMembers() {
  try {
    const employees = await prisma.employee.findMany({
      where: { status: "ACTIVE" },
      orderBy: { lastName: 'asc' }
    })
    return { success: true, data: employees }
  } catch (error) {
    console.error("Failed to fetch available crew members:", error)
    return { success: false, error: "Failed to fetch crew members" }
  }
}

export async function clockIn(data: {
  employeeId: string;
  projectId?: string;
  lat: number;
  long: number;
  type?: "WORK" | "TRAVEL" | "BREAK";
}) {
  try {
    // Check if already clocked in
    const activeEntry = await prisma.timeEntry.findFirst({
      where: {
        employeeId: data.employeeId,
        endTime: null
      }
    });

    if (activeEntry) {
      return { success: false, error: "Already clocked in" };
    }

    const entry = await prisma.timeEntry.create({
      data: {
        employeeId: data.employeeId,
        projectId: data.projectId,
        startTime: new Date(),
        startLat: data.lat,
        startLong: data.long,
        type: data.type || "WORK",
        status: "PENDING"
      }
    });
    revalidatePath('/dashboard');
    return { success: true, data: entry };
  } catch (error) {
    console.error("Failed to clock in:", error);
    return { success: false, error: "Failed to clock in" };
  }
}

export async function clockOut(data: {
  employeeId: string;
  lat: number;
  long: number;
}) {
  try {
    const activeEntry = await prisma.timeEntry.findFirst({
      where: {
        employeeId: data.employeeId,
        endTime: null
      }
    });

    if (!activeEntry) {
      return { success: false, error: "Not clocked in" };
    }

    const entry = await prisma.timeEntry.update({
      where: { id: activeEntry.id },
      data: {
        endTime: new Date(),
        endLat: data.lat,
        endLong: data.long,
      }
    });
    revalidatePath('/dashboard');
    return { success: true, data: entry };
  } catch (error) {
    console.error("Failed to clock out:", error);
    return { success: false, error: "Failed to clock out" };
  }
}

export async function getClockStatus(employeeId: string) {
  try {
    const activeEntry = await prisma.timeEntry.findFirst({
      where: {
        employeeId,
        endTime: null
      }
    });
    return { success: true, data: activeEntry };
  } catch (error) {
    console.error("Failed to get clock status:", error);
    return { success: false, error: "Failed to get clock status" };
  }
}

export async function dispatchCrew(data: {
  crew: { id: string; role: string }[];
  assets: string[];
  projectId: string;
  priority: boolean;
  estimatedDailyCost: number;
}) {
  try {
    // 1. Find Foreman
    const foreman = data.crew.find(m => m.role === 'Foreman');
    if (!foreman) {
      return { success: false, error: "Crew must have a Foreman" };
    }

    // 2. Create Crew
    const crewName = `Dispatch ${new Date().toLocaleDateString()}`;

    const newCrew = await prisma.crew.create({
      data: {
        name: crewName,
        foremanId: foreman.id!,
        members: {
          create: data.crew.map(m => ({
            employeeId: m.id,
            role: m.role
          }))
        }
      }
    });

    // 3. Update Assets location/status
    if (data.assets.length > 0) {
      await prisma.asset.updateMany({
        where: { id: { in: data.assets } },
        data: {
          status: 'IN_USE',
          location: 'On Site', // Ideally fetch project location
          // TODO: Link to project if Asset model supports it
        }
      });
    }

    revalidatePath('/dashboard');
    return { success: true, data: newCrew };
  } catch (error) {
    console.error("Failed to dispatch crew:", error);
    return { success: false, error: "Failed to dispatch crew" };
  }
}
