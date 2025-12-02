import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        include: { employee: true }
    });

    console.log(`Found ${users.length} users.`);

    for (const user of users) {
        if (user.employee) {
            console.log(`User ${user.email} already has employee record.`);
            continue;
        }

        console.log(`Creating employee for ${user.email}...`);

        const nameParts = (user.name || "Unknown User").split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ") || "Unknown";

        try {
            const employee = await prisma.employee.create({
                data: {
                    firstName,
                    lastName,
                    role: user.role,
                    user: { connect: { id: user.id } }
                }
            });
            console.log(`Created employee ${employee.id} for user ${user.email}`);
        } catch (e) {
            console.error(`Failed to create employee for ${user.email}:`, e);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
