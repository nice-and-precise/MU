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
            createdBy: true,
            productionEntries: true
        },
        orderBy: { updatedAt: 'desc' }
    });

    // 3. Map to Crew format
    // If we have reports, use them. If not, fallback to active projects (simulated) so dashboard isn't empty in demo.

    if (todaysReports.length > 0) {
        return todaysReports.map(report => {
            // Try to parse production to see what they are doing
            let currentActivity = 'On Site';

            // Relational Check
            if (report.productionEntries && report.productionEntries.length > 0) {
                const lastLog = report.productionEntries[report.productionEntries.length - 1];
                // Parse description if needed or just use it. Description is "Activity, Pitch: X, ..."
                // Simple split to get activity name
                const activityName = lastLog.description.split(',')[0];
                currentActivity = `${activityName} ${lastLog.quantity ? `@ ${lastLog.quantity}ft` : ''}`;
            } else {
                currentActivity = 'No Activity Logged';
            }

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
    const [
        activeProjects,
        totalRevenueAggregate,
        pendingApprovals,
        inventoryItems,
        activeFleet,
        openSafetyIssues,
        overdueInvoices,
        changeOrders,
        dbOpenPunchItems
    ] = await Promise.all([
        prisma.project.count({
            where: { status: "IN_PROGRESS" },
        }),
        // Revenue calculation 
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
            where: { status: "ACTIVE" }
        }),
        prisma.correctiveAction.count({
            where: { status: "OPEN" }
        }),
        // Aged AR (> 30 days) - simplified to just total overdue for now
        prisma.invoice.aggregate({
            _sum: { currentDue: true },
            where: {
                status: "APPROVED", // Assuming APPROVED means SENT/UNPAID
                createdAt: {
                    lt: new Date(new Date().setDate(new Date().getDate() - 30))
                }
            }
        }),
        prisma.changeOrder.findMany({
            where: { status: "PENDING" },
            take: 5,
            include: { project: true },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.punchItem.count({
            where: { status: "OPEN" }
        })
    ]);

    const inventoryValue = inventoryItems.reduce((acc, item) => {
        return acc + (item.quantityOnHand * (item.costPerUnit || 0));
    }, 0);

    return {
        activeProjects,
        totalRevenue: totalRevenueAggregate._sum.budget || 0,
        pendingApprovals,
        inventoryValue,
        activeFleet,
        openSafetyIssues,
        agedAr: overdueInvoices._sum.currentDue || 0,
        pendingChangeOrders: changeOrders.map(co => ({
            id: co.id,
            project: co.project.name,
            scope: co.scope,
            amount: co.budgetImpact || 0,
            date: co.createdAt
        })),
        openPunchItems: dbOpenPunchItems
    };
}

export async function getSuperStatsService() {
    // 1. Get Active Projects
    const activeProjects = await prisma.project.findMany({
        where: { status: "IN_PROGRESS" },
        include: {
            dailyReports: {
                where: {
                    reportDate: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            },
            incidents: {
                where: {
                    // Open safety incidents
                    // Assuming we might want to filter by date or status, but schema doesn't have explicit status on Incident logic yet besides severity?
                    // Actually SafetyIncident doesn't have status, let's assume all recent ones are relevant or check if we can link to corrective actions
                },
                take: 1,
                orderBy: { date: 'desc' }
            },
            // Check for low production? We'd need to compare vs plan. Skipping for now.
        }
    });

    const projectAlerts = activeProjects.map(p => {
        const alerts = [];
        const hasReport = p.dailyReports.length > 0;
        if (!hasReport) {
            alerts.push({ type: 'MISSING_REPORT', message: 'No Daily Report today' });
        }

        // Simple check for recent incidents
        if (p.incidents.length > 0) {
            // If incident was today
            const incidentDate = new Date(p.incidents[0].date);
            const today = new Date();
            if (incidentDate.toDateString() === today.toDateString()) {
                alerts.push({ type: 'SAFETY_INCIDENT', message: 'Safety Incident Reported Today' });
            }
        }

        return {
            id: p.id,
            name: p.name,
            alerts
        };
    }).filter(p => p.alerts.length > 0);


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
        myProjects: activeProjects.length,
        openInspections,
        dailyReportsToday,
        projectAlerts
    };
}

export async function getCrewStatsService(userId: string) {
    // 1. Find User's active Time Entry
    const activeTimeEntry = await prisma.timeEntry.findFirst({
        where: {
            employee: { userId: userId },
            endTime: null
        },
        include: { project: true }
    });

    // 2. Find User's Assigned Project (via Crew or direct shift)
    // Simplified: Find a shift for today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const shift = await prisma.shift.findFirst({
        where: {
            OR: [
                { employee: { userId: userId } },
                { crew: { members: { some: { employee: { userId: userId } } } } }
            ],
            startTime: { gte: todayStart, lte: todayEnd }
        },
        include: {
            project: true,
            assets: {
                include: { asset: true }
            },
            crew: {
                include: {
                    members: {
                        include: {
                            employee: true
                        }
                    }
                }
            }
        }
    });

    const currentProject = activeTimeEntry?.project || shift?.project;

    // 3. Calculate "Labor Cost Lens"
    // Fetch all time entries for this crew/project for TODAY
    let todaysLaborCost = 0;
    let effectiveHourlyRate = 0;

    if (currentProject) {
        // Identify who is "on the crew" to sum up costs
        // If we found a shift, use that crew. If not, maybe just the current user (if solo).
        const crewMemberIds = shift?.crew?.members.map(m => m.employeeId) || [];
        // If no shift, we at least include the current user if they have an active entry
        if (crewMemberIds.length === 0 && activeTimeEntry) {
            crewMemberIds.push(activeTimeEntry.employeeId);
        }

        if (crewMemberIds.length > 0) {
            const todaysEntries = await prisma.timeEntry.findMany({
                where: {
                    employeeId: { in: crewMemberIds },
                    startTime: { gte: todayStart }
                },
                include: { employee: true }
            });

            const now = new Date();
            let totalHours = 0;

            todaysEntries.forEach(entry => {
                const start = new Date(entry.startTime).getTime();
                const end = entry.endTime ? new Date(entry.endTime).getTime() : now.getTime();
                const durationHours = (end - start) / (1000 * 60 * 60);

                // Simple Cost = Hours * Rate
                // TODO: Add OT logic later if needed
                const cost = durationHours * (entry.employee.hourlyRate || 0);
                todaysLaborCost += cost;

                // Only count "productive" hours for effective rate (exclude break?)
                // For now, assume all logged time is productive or we just average the rates
                if (entry.type === 'WORK') {
                    totalHours += durationHours;
                }
            });

            // Effective Rate = Average hourly rate of active/working crew members
            // Or typically: Total Cost / Total Hours
            if (totalHours > 0) {
                effectiveHourlyRate = todaysLaborCost / totalHours;
            } else {
                // Fallback to average of base rates
                const rates = todaysEntries.map(e => e.employee.hourlyRate || 0).filter(r => r > 0);
                if (rates.length > 0) {
                    effectiveHourlyRate = rates.reduce((a, b) => a + b, 0) / rates.length;
                }
            }
        }
    }


    // 4. Check Daily Report Status for this project/crew
    let dailyReportStatus = 'NOT_STARTED';
    let dailyReportId = null;

    if (currentProject) {
        const todayReport = await prisma.dailyReport.findFirst({
            where: {
                projectId: currentProject.id,
                reportDate: { gte: todayStart }
            }
        });
        if (todayReport) {
            dailyReportStatus = todayReport.status;
            dailyReportId = todayReport.id;
        }
    }

    // 5. Get Assigned Assets from Shift
    const assignedAssets = shift?.assets.map((sa: any) => sa.asset) || [];

    return {
        activeTimeEntry,
        currentProject,
        dailyReportStatus,
        dailyReportId,
        nextLocation: currentProject?.location || 'No Assignment',
        todaysLaborCost,
        effectiveHourlyRate,
        assignedAssets
    };
}
