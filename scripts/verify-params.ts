
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Verifying owner...');
    const owner = await prisma.user.findUnique({ where: { email: 'owner@midwestunderground.com' } });

    if (!owner) {
        console.error('Owner not found!');
        return;
    }

    console.log('Owner found:', owner.email);
    console.log('Role:', owner.role);

    const match = await bcrypt.compare('password123', owner.password);
    console.log('Password match:', match);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
