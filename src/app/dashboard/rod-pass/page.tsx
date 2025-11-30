import { PrismaClient } from "@prisma/client";
import RodPassForm from "@/components/RodPassForm";

const prisma = new PrismaClient();

async function getActiveBores() {
  return await prisma.bore.findMany({
    where: {
      status: { in: ["IN_PROGRESS", "PLANNED"] }
    },
    include: { project: { select: { name: true } } },
  });
}

export default async function RodPassPage() {
  const bores = await getActiveBores();

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Log Rod Pass</h1>
      <RodPassForm bores={bores} />
    </div>
  );
}
