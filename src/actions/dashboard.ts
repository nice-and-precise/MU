'use server';

import { prisma } from '@/lib/prisma';

export async function getDashboardStats() {
    try {
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

        return {
            activeProjects,
            activeTickets,
            totalAssets,
            deployedAssets,
            activeCrews,
            totalEmployees: employees
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
            activeProjects: 0,
            activeTickets: 0,
            totalAssets: 0,
            deployedAssets: 0,
            activeCrews: 0,
            totalEmployees: 0
        };
    }
}

export async function getRecentActivity() {
    try {
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
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        return [];
    }
}

export async function getActiveCrews() {
    // In a real app, this would query a CrewAssignment model
    // For now, we'll fetch active projects and simulate crew data
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
