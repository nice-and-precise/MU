
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting migration of DailyReport JSON fields to relational tables...');

    // 0. CLEAR EXISTING DATA (Idempotency)
    console.log('Clearing existing relational data...');
    await prisma.dailyReportLabor.deleteMany({});
    await prisma.dailyReportEquipment.deleteMany({});
    await prisma.dailyReportMaterial.deleteMany({});
    await prisma.dailyReportProduction.deleteMany({});

    // 1. Fetch all Inventory Items for lookup (to satisfy require name/unit in DailyReportMaterial)
    const inventoryItems = await prisma.inventoryItem.findMany();
    const itemMap = new Map<string, { name: string; unit: string }>();
    inventoryItems.forEach(item => {
        itemMap.set(item.id, { name: item.name, unit: item.unit });
    });

    // 2. Fetch all Daily Reports
    const reports = await prisma.dailyReport.findMany();
    console.log(`Found ${reports.length} reports to process.`);

    for (const report of reports) {
        console.log(`Processing Report: ${report.id} (${report.reportDate.toISOString().split('T')[0]})`);

        // --- Migrate Labor ---
        try {
            const laborList = JSON.parse(report.labor || "[]");
            if (Array.isArray(laborList)) {
                for (const item of laborList) {
                    if (!item.employeeId) continue;

                    await prisma.dailyReportLabor.create({
                        data: {
                            dailyReportId: report.id,
                            employeeId: item.employeeId,
                            hours: Number(item.hours) || 0,
                            type: 'REGULAR',
                            costCode: item.role || undefined, // Capture Role here
                        }
                    });
                }
            }
        } catch (e) {
            console.error(`Failed to migrate Labor for report ${report.id}:`, e);
        }

        // --- Migrate Equipment ---
        try {
            const eqList = JSON.parse(report.equipment || "[]");
            if (Array.isArray(eqList)) {
                for (const item of eqList) {
                    if (!item.assetId) continue;
                    await prisma.dailyReportEquipment.create({
                        data: {
                            dailyReportId: report.id,
                            assetId: item.assetId,
                            hours: Number(item.hours) || 0,
                        }
                    });
                }
            }
        } catch (e) {
            console.error(`Failed to migrate Equipment for report ${report.id}:`, e);
        }

        // --- Migrate Materials ---
        try {
            const matList = JSON.parse(report.materials || "[]");
            if (Array.isArray(matList)) {
                for (const item of matList) {
                    if (!item.inventoryItemId) continue;

                    const invItem = itemMap.get(item.inventoryItemId);
                    const name = invItem ? invItem.name : "Unknown Item";
                    const unit = invItem ? invItem.unit : "EA";

                    await prisma.dailyReportMaterial.create({
                        data: {
                            dailyReportId: report.id,
                            inventoryItemId: item.inventoryItemId,
                            quantity: Number(item.quantity) || 0,
                            name: name,
                            unit: unit,
                        }
                    });
                }
            }
        } catch (e) {
            console.error(`Failed to migrate Materials for report ${report.id}:`, e);
        }

        // --- Migrate Production ---
        try {
            const prodList = JSON.parse(report.production || "[]");
            if (Array.isArray(prodList)) {
                for (const item of prodList) {
                    // item: { activity, lf, pitch, azimuth }
                    // Map to DailyReportProduction: { quantity, unit, description }

                    const descriptionParts = [item.activity || "Production"];
                    if (item.pitch !== undefined) descriptionParts.push(`Pitch: ${item.pitch}`);
                    if (item.azimuth !== undefined) descriptionParts.push(`Az: ${item.azimuth}`);

                    await prisma.dailyReportProduction.create({
                        data: {
                            dailyReportId: report.id,
                            quantity: Number(item.lf) || 0,
                            unit: 'FT',
                            description: descriptionParts.join(', '),
                            // boreId? If we can link it. But JSON doesn't seem to have boreId usually in this simple schema.
                        }
                    });
                }
            }
        } catch (e) {
            console.error(`Failed to migrate Production for report ${report.id}:`, e);
        }
    }

    console.log('Migration completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
