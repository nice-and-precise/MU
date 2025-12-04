
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
    console.log('⏳ Starting Time & Crew Seeding...');

    // 1. Get Active Employees & Projects
    const employees = await prisma.employee.findMany({
        where: { status: 'ACTIVE' },
        include: { user: true }
    });

    if (employees.length === 0) {
        console.log('No active employees found. Run generate_dummy_employees.ts first.');
        return;
    }

    const projects = await prisma.project.findMany({
        where: { status: { in: ['IN_PROGRESS', 'PLANNING', 'COMPLETED'] } }
    });

    if (projects.length === 0) {
        console.log('No projects found. Run basic seed first.');
        return;
    }

    // 2. Create Crews
    console.log('Creating Crews...');
    const foremen = employees.filter(e => e.role === 'Foreman' || e.role === 'Superintendent');
    const operators = employees.filter(e => e.role === 'Operator');
    const laborers = employees.filter(e => e.role === 'Laborer');
    const others = employees.filter(e => !['Foreman', 'Superintendent', 'Operator', 'Laborer'].includes(e.role));

    // Helper to get random subset
    const getRandomSubset = (arr: any[], count: number) => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    const crewConfigs = [
        { name: 'Fiber Crew A', type: 'Drill' },
        { name: 'River Crossing Crew', type: 'Special' },
        { name: 'Service Crew', type: 'Service' },
        { name: 'Rock Drill Crew', type: 'Drill' }
    ];

    const crews = [];

    for (const config of crewConfigs) {
        // Pick a foreman
        const foreman = foremen.length > 0 ? foremen[Math.floor(Math.random() * foremen.length)] : employees[0];

        // Check if crew exists
        let crew = await prisma.crew.findFirst({ where: { name: config.name } });
        if (!crew) {
            crew = await prisma.crew.create({
                data: {
                    name: config.name,
                    foremanId: foreman.id
                }
            });
        }
        crews.push(crew);

        // Assign members (CrewMember)
        // Clear existing members for this crew to avoid dupes in this run
        await prisma.crewMember.deleteMany({ where: { crewId: crew.id } });

        const crewMembers = [
            ...getRandomSubset(operators, 2),
            ...getRandomSubset(laborers, 2),
            ...getRandomSubset(others, 1)
        ];

        for (const member of crewMembers) {
            await prisma.crewMember.create({
                data: {
                    crewId: crew.id,
                    employeeId: member.id,
                    role: member.role
                }
            });
        }
    }

    // 3. Generate Time History (Last 12 weeks)
    console.log('Generating Time History...');
    const weeksToSeed = 12;
    const now = new Date();

    // Process each employee
    for (const employee of employees) {
        // Skip some employees to make it realistic (not everyone worked every week)
        if (Math.random() > 0.9) continue;

        for (let w = 0; w < weeksToSeed; w++) {
            const weekStart = new Date(now);
            weekStart.setDate(weekStart.getDate() - (w * 7));
            // Set to Monday
            const day = weekStart.getDay();
            const diff = weekStart.getDate() - day + (day == 0 ? -6 : 1);
            weekStart.setDate(diff);
            weekStart.setHours(0, 0, 0, 0);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);

            // Create TimeCard
            const timeCard = await prisma.timeCard.create({
                data: {
                    employeeId: employee.id,
                    periodStart: weekStart,
                    periodEnd: weekEnd,
                    status: w === 0 ? 'DRAFT' : 'APPROVED', // Current week draft, past approved
                    totalRegularHours: 0,
                    totalOvertime: 0
                }
            });

            let weeklyHours = 0;
            let weeklyOvertime = 0;

            // Generate entries for Mon-Fri (and sometimes Sat)
            const daysWorked = Math.random() > 0.8 ? 6 : 5;

            for (let d = 0; d < daysWorked; d++) {
                const date = new Date(weekStart);
                date.setDate(date.getDate() + d);

                // Pick a project
                const project = projects[Math.floor(Math.random() * projects.length)];

                // Hours for the day (8-12 hours)
                const hours = 8 + Math.random() * 4;
                const startTime = new Date(date);
                startTime.setHours(7, 0, 0, 0); // 7 AM start
                const endTime = new Date(startTime);
                endTime.setMinutes(startTime.getMinutes() + (hours * 60));

                // Create TimeEntry
                await prisma.timeEntry.create({
                    data: {
                        employeeId: employee.id,
                        projectId: project.id,
                        startTime: startTime,
                        endTime: endTime,
                        type: 'WORK',
                        status: w === 0 ? 'PENDING' : 'APPROVED',
                        description: `Work on ${project.name}`
                    }
                });

                weeklyHours += hours;
            }

            // Update TimeCard totals
            if (weeklyHours > 40) {
                weeklyOvertime = weeklyHours - 40;
                weeklyHours = 40;
            }

            await prisma.timeCard.update({
                where: { id: timeCard.id },
                data: {
                    totalRegularHours: weeklyHours,
                    totalOvertime: weeklyOvertime
                }
            });
        }
    }

    console.log('✅ Time & Crew Seeding Complete!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
