
import { PrismaClient } from '@prisma/client';
import { seedDemoData } from '../src/lib/seed/seedDemoData';

const prisma = new PrismaClient();

async function main() {
  try {
    await seedDemoData(prisma);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
