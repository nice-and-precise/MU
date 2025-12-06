import { prisma } from '@/lib/prisma';

export async function getDashboardStatsService() {
    const [
        activeProjects,
        activeTickets,
        totalAssets,
        deployedAssets,
        employees
    ] = await Promise.all([
        prisma.project.count({ where: { status: 'IN_PROGRESS' } }),
        prisma.ticket811.count({ where: { status: 'ACTIVE' } }),
        prisma.asset.count(),
        prisma.asset.count({ where: { projectId: { not: null } } }),
        prisma.user.count({ where: { role: { not: 'OWNER' } } })
    ]);

    // Simulate active crews based on recent reports or assignments
    // For now, we'll estimate based on active projects * 1.5 (avg crews per project)
    const activeCrews = Math.round(activeProjects * 1.2) || 0;

    // Calculate Labor Metrics
    const activeEmployees = await prisma.employee.findMany({
        where: { status: 'ACTIVE' },
        select: { hourlyRate: true }
    });

    const totalHourlyCost = activeEmployees.reduce((sum, emp) => sum + (emp.hourlyRate || 0), 0);
    const avgLaborRate = activeEmployees.length > 0 ? totalHourlyCost / activeEmployees.length : 0;

    // Mock Production Data for Cost/Ft (until we have real production data linked)
    // Assume 500ft/day avg per crew
    const estimatedDailyProduction = activeCrews * 500;
    const dailyLaborCost = totalHourlyCost * 10; // 10 hour day
    const laborCostPerFoot = estimatedDailyProduction > 0 ? dailyLaborCost / estimatedDailyProduction : 0;

    // Calculate QC/Punch List Trends
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const qcOpenLast7Days = await prisma.punchItem.count({
        where: {
            status: 'OPEN',
            createdAt: {
                gte: sevenDaysAgo
            }
        }
    });

    return {
        activeProjects,
        activeTickets,
        totalAssets,
        deployedAssets,
        activeCrews,
        totalEmployees: employees,
        laborCostPerHour: totalHourlyCost,
        laborCostPerFoot: laborCostPerFoot,
        qcOpenLast7Days
    };
}

export async function getRecentActivityService() {
    const [recentReports, newTickets, incidents] = await Promise.all([
        prisma.dailyReport.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { project: true, createdBy: true }
        }),
        prisma.ticket811.findMany({
            take: 5,
            orderBy: { submittedAt: 'desc' }
        }),
        prisma.safetyIncident?.findMany({
            take: 3,
            orderBy: { date: 'desc' },
            include: { project: true }
        }) || []
    ]);

    // Combine and sort
    const activity = [
        ...recentReports.map(r => ({
            id: r.id,
            type: 'REPORT',
            title: `Daily Report: ${r.project.name}`,
            date: r.createdAt,
            user: r.createdBy.name,
            status: r.status
        })),
        ...newTickets.map(t => ({
            id: t.id,
            type: 'TICKET',
            title: `811 Ticket: ${t.ticketNumber}`,
            date: t.submittedAt,
            user: t.caller,
            status: t.status
        })),
        ...incidents.map(i => ({
            id: i.id,
            type: 'INCIDENT',
            title: `Safety Incident: ${i.type}`,
            date: i.date,
            user: 'Safety Officer',
            status: 'OPEN'
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    return activity;
}

export async function getActiveCrewsService() {
    // 1. Get today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 2. Find Daily Reports created or updated today (DRAFT or APPROVED)
    // This tells us who is actually logging data right now.
    const todaysReports = await prisma.dailyReport.findMany({
        where: {
            updatedAt: {
                gte: startOfDay,
                lte: endOfDay
            }
        },
        include: {
            project: true,
            createdBy: true
        },
        orderBy: { updatedAt: 'desc' }
    });

    // 3. Map to Crew format
    // If we have reports, use them. If not, fallback to active projects (simulated) so dashboard isn't empty in demo.

    if (todaysReports.length > 0) {
        return todaysReports.map(report => {
            // Try to parse production to see what they are doing
            let currentActivity = 'On Site';
            try {
                const prod = JSON.parse(report.production || '[]');
                if (prod.length > 0) {
                    const lastLog = prod[prod.length - 1];
                    currentActivity = `${lastLog.activity} ${lastLog.lf ? `@ ${lastLog.lf}ft` : ''}`;
                }
            } catch (e) { }

            return {
                id: report.project.id,
                name: report.project.name,
                foreman: report.createdBy.name || 'Unknown',
                status: currentActivity,
                location: report.project.location || 'Unknown',
                lastUpdate: report.updatedAt // Pass this to UI if needed
            };
        });
    }

    // Fallback for Demo if no reports today
    const projects = await prisma.project.findMany({
        where: { status: 'IN_PROGRESS' },
        take: 5,
        include: {
            shifts: {
                where: { status: 'IN_PROGRESS' },
                include: {
                    crew: {
                        include: {
                            foreman: true
                        }
                    }
                }
            }
        }
    });

    return projects.map(p => {
        const activeShift = p.shifts[0];
        const foreman = activeShift?.crew?.foreman;
        const foremanName = foreman ? `${foreman.firstName} ${foreman.lastName}` : 'Unassigned';

        return {
            id: p.id,
            name: p.name,
            foreman: foremanName,
            status: activeShift ? 'On Site' : 'Scheduled',
            location: p.location || 'Unknown'
        };
    });
}

export async function getOwnerStatsService() {
    const [activeProjects, totalRevenue, pendingApprovals, inventoryItems, activeFleet, openSafetyIssues] = await Promise.all([
        prisma.project.count({
            where: { status: "IN_PROGRESS" },
        }),
        // Revenue calculation is complex, simplified for now
        prisma.project.aggregate({
            _sum: { budget: true },
            where: { status: { in: ["IN_PROGRESS", "COMPLETED"] } },
        }),
        prisma.changeOrder.count({
            where: { status: "PENDING" },
        }),
        prisma.inventoryItem.findMany({
            select: { quantityOnHand: true, costPerUnit: true }
        }),
        prisma.asset.count({
            where: { status: "AVAILABLE" }
        }),
        prisma.correctiveAction.count({
            where: { status: "OPEN" }
        })
    ]);

    const inventoryValue = inventoryItems.reduce((acc, item) => {
        return acc + (item.quantityOnHand * (item.costPerUnit || 0));
    }, 0);

    return {
        activeProjects,
        totalRevenue: totalRevenue._sum.budget || 0,
        pendingApprovals,
        inventoryValue,
        activeFleet,
        openSafetyIssues
    };
}

export async function getSuperStatsService() {
    // In a real app, we'd filter by projects assigned to this super
    // For now, we'll just return global stats or mock the assignment logic
    const myProjects = await prisma.project.count({
        where: { status: "IN_PROGRESS" },
    });

    const openInspections = await prisma.inspection.count({
        where: { status: "OPEN" },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyReportsToday = await prisma.dailyReport.count({
        where: {
            reportDate: {
                gte: today,
            },
        },
        orderBy: { reportDate: 'desc' }
    });

    return {
        myProjects,
        openInspections,
        dailyReportsToday,
    };
}

export async function getCrewStatsService() {
    // Mocking current assignment
    const currentAssignment = await prisma.project.findFirst({
        where: { status: "IN_PROGRESS" },
        include: { bores: true },
    });

    return {
        currentAssignment,
        todayProduction: 120, // Mocked for now
    };
}
